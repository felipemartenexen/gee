var oldBands = ['QA60', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12', 'B12'];

var newBands = ['QA60', 'cb', 'blue', 'green', 'red', 'red1', 'red2', 'red3', 'nir', 'nir2', 'waterVapor', 'swir1', 'swir2', 'cloudShadowMask'];

var sentinel = ee.ImageCollection(ee.Join.saveFirst('cloud_mask').apply({
        primary: ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED'),
        secondary: ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY"),
        condition:ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
      }))
  .filterDate('2021-01-01','2022-01-01')
  .filterBounds(geometry)
  .filter(ee.Filter.inList('system:index', require('users/geomapeamentoipam/GT_Fogo_MapBiomas:3- Monitoramento Fogo/module-blockList-sentinel_2').blockList()).not())
  .map(function (image){
        // --- funtion maskEdge ref ->  https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_CLOUD_PROBABILITY 
        return image
          .updateMask(image.select('B8A').mask()
              .updateMask(image.select('B9').mask()));
        
      })
  .map(function (image){
        // --- funtion maskClouds ref ->  https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_CLOUD_PROBABILITY 
        var max_cloud_probability = 65;
        var clouds = ee.Image(image.get('cloud_mask')).select('probability');
        var isNotCloud = clouds.lt(max_cloud_probability);
        return image.updateMask(isNotCloud);
      })
  .select(oldBands,newBands)
  .map(function(image){
    var nbr = image.normalizedDifference(['nir','swir1'])
      .multiply(-1)
      .rename('nbr');

    return image
      .addBands(nbr);
  });
      
var qualityMosaic = sentinel.qualityMosaic('nbr');

Map.addLayer(qualityMosaic,{bands:['swir1','nir','red'],min:300,max:4000},'qualityMosaic');

var landsat8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2");

var blockList_landsat = require('users/geomapeamentoipam/MapBiomas__Fogo:00_Tools/module-blockList').landsat();

var year = 2013;
var set_region = 18;

// Define start and end dates, and the region set ID.
var dateStart = (year) + '-01-01';
var dateEnd = (year + 1) + '-01-01';

// Load the region feature collection.
var region = ee.FeatureCollection("users/geomapeamentoipam/AUXILIAR/regioes_biomas");

// Filter the region based on the set ID.
region = region.filterMetadata('region', 'equals', set_region);

// recortando bordas de cenas landsat
function clipBoard_Landsat(image){
  return image
    .updateMask(ee.Image().paint(image.geometry().buffer(-3000)).eq(0));
}

function corrections_LS8_col2 (image){

  // - radiometric correction
  var opticalBands = image.select('SR_B.*').multiply(0.0000275).add(-0.2);
  // rectfy to dark corpse reflectance == -0.0000000001
  opticalBands = opticalBands.multiply(10000).subtract(0.0000275 * 0.2 * 1e5 * 100).round()
    .divide(10000);
  
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  
  // - return 
  image = image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
    
  // - masks
  // If the cloud bit (3) is set and the cloud confidence (9) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var qa = image.select('QA_PIXEL');
      var cloud = qa.bitwiseAnd(1 << 3)
      .and(qa.bitwiseAnd(1 << 9))
      .or(qa.bitwiseAnd(1 << 4));
  
  // If the clear bit (6) is set 
  // or water bit is set (7), then it's a good pixel 
  var good_pixel  = qa.bitwiseAnd(1 << 6)
      .or(qa.bitwiseAnd(1 << 7));

  // read radsat 
  var radsatQA = image.select('QA_RADSAT');
  // Is any band saturated? 
  var saturated = radsatQA.bitwiseAnd(1 << 0)
    .or(radsatQA.bitwiseAnd(1 << 1))
      .or(radsatQA.bitwiseAnd(1 << 2))
        .or(radsatQA.bitwiseAnd(1 << 3))
          .or(radsatQA.bitwiseAnd(1 << 4))
            .or(radsatQA.bitwiseAnd(1 << 5))
              .or(radsatQA.bitwiseAnd(1 << 6));

  // is any band with negative reflectance? 
  var negative_mask = image.select(['SR_B1']).gt(0).and(
    image.select(['SR_B2']).gt(0)).and(
      image.select(['SR_B3']).gt(0)).and(
        image.select(['SR_B4']).gt(0)).and(
          image.select(['SR_B5']).gt(0)).and(
            image.select(['SR_B7']).gt(0));

  
  // -return 
  image = image
  .updateMask(cloud.not())
  .updateMask(good_pixel)
  .updateMask(saturated.not())
  .updateMask(negative_mask);
  
  
  // correction bandnames to default
  var oldBands = ['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7',];
  var newBands = ['blue', 'green','red',  'nir',  'swir1','swir2'];
  
  image = image.select(oldBands,newBands);
  // - 
  return image.float();

  // - return timeFlag_landsat(image);
}

function addBand_NBR (image){
  var exp = '( b("nir") - b("swir2") ) / ( b("nir") + b("swir2") )';
  var minimoNBR = image
    .expression(exp)
    // -> na formula da USGS as cicatrizes ocupam os menores valores e multiplicamos o resultado por -1 para que 
    // as cicatrizes ocupem os valores maximos utilizados como referencia no processamento dos mosaicos de qualidade
    .multiply(-1)
    // -> adequações legadas
    .add(1)
    .multiply(1000)
    .int16()
    .rename("nbr");
  return image
    .addBands(minimoNBR);
}

var mosaic = landsat8
  .filter(ee.Filter.inList('system:index', blockList_landsat).not())
  .filterDate(dateStart, dateEnd)
  .filterBounds(region)
  .map(clipBoard_Landsat)
  .map(corrections_LS8_col2)
  .map(addBand_NBR);
  
var quality_mosaic = mosaic.qualityMosaic('nbr').clip(region);

Map.addLayer(quality_mosaic,{
        min:0.03,
        max:0.4,
        bands:['swir1','nir','red'],
      },
      'Quality Mosaic - ' + year + ' - ' + 'Region - ' + (set_region - 10)
    );

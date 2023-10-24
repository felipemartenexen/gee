
// Define start and end dates, and the region set ID.
var dateStart = '2023-02-01';
var dateEnd = '2023-03-01';
var set_region = 12;

var csPlus = ee.ImageCollection("GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED");

// Load the region feature collection.
var region = ee.FeatureCollection("users/geomapeamentoipam/AUXILIAR/regioes_biomas");

// Filter the region based on the set ID.
region = region.filterMetadata('region', 'equals', set_region);

// Load Sentinel-2 surface reflectance data.
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED');

// Get the band names of the CS+ image.
var csPlusBands = csPlus.first().bandNames();

// Link Sentinel-2 and CS+ results.
var linkedCollection = s2.linkCollection(csPlus, csPlusBands);

// Function to mask pixels with low CS+ QA scores.
function maskLowQA(image) {
  var qaBand = 'cs';
  var clearThreshold = 0.60;
  var mask = image.select(qaBand).gte(clearThreshold);

  return image.updateMask(mask);
}

// Define old and new band names for image processing.
var oldBands = ['QA60', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12', 'B12'];
var newBands = ['QA60', 'cb', 'blue', 'green', 'red', 'red1', 'red2', 'red3', 'nir', 'nir2', 'waterVapor', 'swir1', 'swir2', 'cloudShadowMask'];

// Function to calculate and add NBR band to the image.
function addBand_NBR(image){
  var exp = '( b("nir") - b("swir2") ) / ( b("nir") + b("swir2") )';
  var minimoNBR = image.expression(exp)
    .multiply(-1)
    .add(1)
    .multiply(1000)
    .int16()
    .rename("nbr");
  return image.addBands(minimoNBR);
}

// Process the linked collection: filter by date and region, mask low QA pixels, select bands, and calculate NBR.
var composite = linkedCollection
  .filterDate(dateStart, dateEnd)
  .filterBounds(region)
  .map(maskLowQA)
  .select(oldBands, newBands)
  .map(addBand_NBR);

// Create quality mosaic using NBR and clip it to the region of interest.
var qualityMosaic_scoreplus = composite.qualityMosaic('nbr').clip(region);

// Load Sentinel-2 and Sentinel-2 cloud probability data, join on system:index, filter by date and region,
// mask edge pixels, mask clouds, select bands, and calculate NBR.
var sentinel = ee.ImageCollection(ee.Join.saveFirst('cloud_mask').apply({
  primary: ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED"),
  secondary: ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY"),
  condition: ee.Filter.equals({leftField: 'system:index', rightField: 'system:index'})
}))
.filterDate(dateStart, dateEnd)
.filterBounds(region)
.map(function (image){
  return image
    .updateMask(image.select('B8A').mask().updateMask(image.select('B9').mask()));
})
.map(function (image){
  var max_cloud_probability = 65;
  var clouds = ee.Image(image.get('cloud_mask')).select('probability');
  var isNotCloud = clouds.lt(max_cloud_probability);
  return image.updateMask(isNotCloud);
})
.select(oldBands, newBands)
.map(function(image){
  var nbr = image.normalizedDifference(['nir','swir1'])
    .multiply(-1)
    .rename('nbr');
  return image.addBands(nbr);
});

// Create quality mosaic using NBR and clip it to the region of interest.
var qualityMosaic_mapbiomas = sentinel.qualityMosaic('nbr').clip(region);

// Display the quality mosaics on the Map.
Map.addLayer(qualityMosaic_scoreplus, {bands:['swir1','nir','red'], min:300, max:4000}, 'qualityMosaic_scoreplus');
Map.addLayer(qualityMosaic_mapbiomas, {bands:['swir1','nir','red'], min:300, max:4000}, 'qualityMosaic_mapbiomas');

// Create two separate maps for comparison.
var leftMap = ui.Map();
var rightMap = ui.Map();

// Add layers to the maps.
var scoreplus = ui.Map.Layer(qualityMosaic_scoreplus, {bands:['swir1','nir','red'], min:300, max:4000});
var mapbiomas = ui.Map.Layer(qualityMosaic_mapbiomas, {bands:['swir1','nir','red'], min:300, max:4000});

// Add layers to map layers.
var scoreplus_layer = leftMap.layers();
var mapbiomas_layer = rightMap.layers();
scoreplus_layer.add(scoreplus);
mapbiomas_layer.add(mapbiomas);

// Add labels to the maps.
var scoreplus_label = ui.Label('scoreplus_mosaic');
scoreplus_label.style().set('position', 'bottom-left');
var mapbiomas_label = ui.Label('mapbiomas_mosaic');
mapbiomas_label.style().set('position', 'bottom-right');

// Add labels to the maps.
leftMap.add(scoreplus_label);
rightMap.add(mapbiomas_label);

// Create a split panel to compare the maps side by side.
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  orientation: 'horizontal',
  wipe: true
});

// Clear the root container and add the split panel.
ui.root.clear();
ui.root.add(splitPanel);

// Link the two maps for synchronized navigation.
var linkPanel = ui.Map.Linker([leftMap, rightMap]);

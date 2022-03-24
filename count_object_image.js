var mapbiomas_fire = ee.Image("projects/mapbiomas-workspace/public/collection6/mapbiomas-fire-collection1-annual-burned-coverage-1"),
    geometry = 
    /* color: #d63000 */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-54.76613979184045, -4.843373222965199],
          [-54.76613979184045, -5.707608407510396],
          [-53.74441127621545, -5.707608407510396],
          [-53.74441127621545, -4.843373222965199]]], null, false);
          
 
  var fire = ee.Image(1).mask(mapbiomas_fire.select('burned_coverage_2020'));
  
  var bioma = ee.FeatureCollection("users/geomapeamentoipam/AUXILIAR/biomas_IBGE_250mil");
  
  var amazonia = bioma.filterMetadata('Bioma', 'equals', 'Amazônia');
  
  var fire_amazonia = fire.clip(amazonia);
  
  Map.addLayer(fire_amazonia, {palette: 'red'}, 'Fire');

  //Count Raster//

  var object_id = fire_amazonia.connectedComponents(ee.Kernel.square(1), 1024);
  
  Map.addLayer(object_id.randomVisualizer(), null, 'Objects');
  
  var object_size = object_id.select('labels').connectedPixelCount({maxSize: 1024, eightConnected: true});
  
  Map.addLayer(object_size, null, 'Object n pixels');

  print('object_size', object_size);
  
  print('object_id', object_id);

  var fire_count = fire_amazonia.addBands(object_id.select('labels').rename('count'));

  var count_fire = fire_count.reduceRegion({
    reducer: ee.Reducer.countDistinctNonNull(),
    geometry: geometry,
    scale: 30,
    maxPixels: 1e16
  });
    
  print(count_fire.get('count'));
  
  var pixelArea = ee.Image.pixelArea();

  var objectArea = object_size.multiply(pixelArea)
    .reduceRegion(ee.Reducer.sum(), geometry, 30, null, null, false, 1e13);

  print(ee.Number(objectArea.get('labels')).divide(1e6));

  var  fc = ee.Feature(null, {
    'count': count_fire.get('count'),
    //'size': ee.Number(objectArea).divide(1e6)
  });
  
  print(fc);
  
  Export.table.toDrive({
    collection: ee.FeatureCollection(fc),
    description:'count_size_fogo_2020'
    });

  



var roi = ee.FeatureCollection("users/Lucas_Oliveira_Lima/ZP_Resex_Comunidades"),
    classe = ee.Image("users/Lucas_Oliveira_Lima/Resex_recorte_comunidades");
    
var list = ee.List.sequence(1, 10, 1).getInfo();

print(roi.geometry().area().divide(10000));

Map.addLayer(classe, {palette: 'red'}, 'Classe');

Map.addLayer(roi, {}, 'Comunidade');

Map.centerObject(classe);

  function calPol (number) {
    
    var classe_number = ee.Image(1).mask(classe.select('b1').eq(number));
    
    var area = function(feature){
      var area_pxa = classe_number.multiply(ee.Image.pixelArea())
      .reduceRegion(ee.Reducer.sum(), feature.geometry(), 10, null, null, false, 1e13)
      .get('constant');
    
      return feature.set({
        'area_km': ee.Number(area_pxa).divide(1e6),
        'numberClass':number
      });
      
    };
    
    return roi
    .map(area);
      
    }
    

var list = list.map(calPol);

print(list);

var fc = ee.FeatureCollection(list).flatten();

print(fc.first());

Export.table.toDrive({
  collection: fc,
  description: 'area_comunidade_todas'
});


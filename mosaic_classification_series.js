var region = ee.FeatureCollection("users/geomapeamentoipam/AUXILIAR/regioes_biomas");

region = region.filterMetadata('region', 'equals', 18);

var meses = ['1','2','3','4','5','6','7','8','9','10','11','12'];

var ano = 2022;

meses.forEach(function(m){
  
    print(m);
  
    var agro = ee.Image('users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_v2_1_region8_' + ano + '_' + m);

    var forest = ee.Image('users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_v2_2_region8_' + ano + '_' + m);
    
    var agro_mask = ee.Image(1).mask(agro);
    
    var forest_mask = ee.Image(1).mask(forest);
    
    var v4 = ee.ImageCollection([agro_mask ,forest_mask]).mosaic();
    
    v4 = ee.Image(1).mask(v4);
    
    v4 = v4.rename('b1').unmask().float();
    
    Export.image.toAsset({
      image: v4,
      description: 'queimada_amazonia_v4_region8_' + ano + '_' + m,
      assetId: 'users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_v4_region8_' + ano + '_' + m,
      scale: 30,
      region: region,
      maxPixels: 1e13
    });
    
    Map.addLayer(v4.randomVisualizer().clip(region), {}, m, false);
    
  });


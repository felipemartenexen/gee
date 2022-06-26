var region = 7;

var mes = [1,2,3,4,5,6,7,8,9,10,11,12];

var version_from = '4_1';

var version_to = '4';

var year = 2022;

mes.forEach(function(e){
  
  var asset_from = 'users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_'
    + 'v' + version_from 
    + '_region' + region
    + '_' + year
    + '_' + e;
  
  var asset_to = 'users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_'
    + 'v' + version_to 
    + '_region' + region
    + '_' + year
    + '_' + e;
  
  print(asset_to);
  
  ee.data.renameAsset(asset_from, asset_to);
  
});





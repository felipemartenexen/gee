var region = 7;

var mes = [1,2,3,4,5,6,7,8,9,10,11,12];

var version_delete = '4';

var year = 2022;

mes.forEach(function(e){
  
  var asset = 'users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_'
    + 'v' + version_delete 
    + '_region' + region
    + '_' + year
    + '_' + e;

  print(asset);
  ee.data.deleteAsset(asset);  

});


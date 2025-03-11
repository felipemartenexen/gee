var regions = [1,2,3,4,5,6,7,8,9];

regions.forEach(function(e){
  
  var asset_id = "projects/earthengine-legacy/assets/users/geomapeamentoipam/COLECAO_FOGO_SENTINEL/CLASSIFICACAO/AMAZONIA/queimada_amazonia_v9_13_region"+ e + "_2025_2"

  var acl = {
      "owners": ["geomapeamento.ipam@gmail.com"],  
      'all_users_can_read': true
  }
  
  ee.data.setAssetAcl(asset_id, acl)
  
  print("O asset " + asset_id + "agora é público e pode ser acessado por qualquer usuário.");
  
})

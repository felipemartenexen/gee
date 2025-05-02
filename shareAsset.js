var regions = [1];

var years = [];
for (var y = 2000; y <= 2023; y++) {
  years.push(y);
}

years.forEach(function(y){
  
    regions.forEach(function(e){
    
    var asset_id = "projects/ee-felipe-martenexen/assets/fire_col4/fireAgain/image/col4_r" + e +"_v5_" + y;
  
    var acl = {
        "owners": ["luiz.felipe@ipam.org.br"],  
        'all_users_can_read': true
    };
    
    ee.data.setAssetAcl(asset_id, acl);
    
    print("O asset " + asset_id + "agora é público e pode ser acessado por qualquer usuário.");
    
  });
  
});

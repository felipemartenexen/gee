
var area_analise = ee.FeatureCollection('users/ipam_flp/imoveis_analise_buffer_500m');

var ano = 2018;

var mes = 'dez_1';

var area_estudo = bacia;
  
//var focosCalor = ee.FeatureCollection('users/geomapeamentoipam/AUXILIAR/focos/brasil/Focos_' + ano)


var bands = ['B6','B5','B4']; // landsat 08
//var bands = ['B5', 'B4', 'B3']; //landsat 07 e 05

var collection = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR') //2013-Atual
//var collection = ee.ImageCollection("LANDSAT/LE07/C01/T1_SR") // 2000,2001,2002,2012
//var collection = ee.ImageCollection("LANDSAT/LT05/C01/T1_SR") // 2000 a 2011

          .filterDate(''+ano+'-01-01', ''+ano+'-12-31')
          .filterBounds(area_estudo);
          
var dates = collection.map(function(image) {
              return ee.Feature(null, {'date': image.date().format('YYYY-MM-dd')});
            }).distinct('date').aggregate_array('date');
print(dates);

var corte = area_analise;

var bioma_jan_1 = collection.filterDate(''+ano+'-01-01', ''+ano+'-01-15').median();
var bioma_jan_2 = collection.filterDate(''+ano+'-01-16', ''+ano+'-01-30').median();
var bioma_fev_1 = collection.filterDate(''+ano+'-02-01', ''+ano+'-02-15').median();
var bioma_fev_2 = collection.filterDate(''+ano+'-02-16', ''+ano+'-02-28').median();
var bioma_mar_1 = collection.filterDate(''+ano+'-03-01', ''+ano+'-03-15').median();
var bioma_mar_2 = collection.filterDate(''+ano+'-03-16', ''+ano+'-03-30').median();
var bioma_abr_1 = collection.filterDate(''+ano+'-04-01', ''+ano+'-04-15').median();
var bioma_abr_2 = collection.filterDate(''+ano+'-04-16', ''+ano+'-04-30').median();
var bioma_mai_1 = collection.filterDate(''+ano+'-05-01', ''+ano+'-05-15').median();
var bioma_mai_2 = collection.filterDate(''+ano+'-05-16', ''+ano+'-05-31').median();
var bioma_jun_1 = collection.filterDate(''+ano+'-06-01', ''+ano+'-06-15').median();
var bioma_jun_2 = collection.filterDate(''+ano+'-06-16', ''+ano+'-06-30').median();
var bioma_jul_1 = collection.filterDate(''+ano+'-07-01', ''+ano+'-07-15').median();
var bioma_jul_2 = collection.filterDate(''+ano+'-07-16', ''+ano+'-07-31').median();
var bioma_ago_1 = collection.filterDate(''+ano+'-08-01', ''+ano+'-08-15').median();
var bioma_ago_2 = collection.filterDate(''+ano+'-08-16', ''+ano+'-08-30').median();
var bioma_set_1 = collection.filterDate(''+ano+'-09-01', ''+ano+'-09-15').median();
var bioma_set_2 = collection.filterDate(''+ano+'-09-16', ''+ano+'-09-30').median();
var bioma_out_1 = collection.filterDate(''+ano+'-10-01', ''+ano+'-10-15').median();
var bioma_out_2 = collection.filterDate(''+ano+'-10-16', ''+ano+'-10-31').median();
var bioma_nov_1 = collection.filterDate(''+ano+'-11-01', ''+ano+'-11-15').median();
var bioma_nov_2 = collection.filterDate(''+ano+'-11-16', ''+ano+'-11-30').median();
var bioma_dez_1 = collection.filterDate(''+ano+'-12-01', ''+ano+'-12-15').median();
var bioma_dez_2 = collection.filterDate(''+ano+'-12-16', ''+ano+'-12-31').median();

Map.addLayer(bioma_jan_1.clip(corte), {bands: bands, min: 300, max:6000}, 'jan1_'+ano, false);
Map.addLayer(bioma_jan_2.clip(corte), {bands: bands, min: 300, max:6000}, 'jan2_'+ano, false);
Map.addLayer(bioma_fev_1.clip(corte), {bands: bands, min: 300, max:6000}, 'fev1_'+ano, false);
Map.addLayer(bioma_fev_2.clip(corte), {bands: bands, min: 300, max:6000}, 'fev2_'+ano, false);
Map.addLayer(bioma_mar_1.clip(corte), {bands: bands, min: 300, max:6000}, 'mar1_'+ano, false);
Map.addLayer(bioma_mar_2.clip(corte), {bands: bands, min: 300, max:6000}, 'mar2_'+ano, false);
Map.addLayer(bioma_abr_1.clip(corte), {bands: bands, min: 300, max:6000}, 'abr1_'+ano, false);
Map.addLayer(bioma_abr_2.clip(corte), {bands: bands, min: 300, max:6000}, 'abr2_'+ano, false);
Map.addLayer(bioma_mai_1.clip(corte), {bands: bands, min: 300, max:6000}, 'mai1_'+ano, false);
Map.addLayer(bioma_mai_2.clip(corte), {bands: bands, min: 300, max:6000}, 'mai2_'+ano, false);
Map.addLayer(bioma_jun_1.clip(corte), {bands: bands, min: 300, max:6000}, 'jun1_'+ano, false);
Map.addLayer(bioma_jun_2.clip(corte), {bands: bands, min: 300, max:6000}, 'jun2_'+ano, false);
Map.addLayer(bioma_jul_1.clip(corte), {bands: bands, min: 300, max:6000}, 'jul1_'+ano, false);
Map.addLayer(bioma_jul_2.clip(corte), {bands: bands, min: 300, max:6000}, 'jul2_'+ano, false);
Map.addLayer(bioma_ago_1.clip(corte), {bands: bands, min: 300, max:6000}, 'ago1_'+ano, false);
Map.addLayer(bioma_ago_2.clip(corte), {bands: bands, min: 300, max:6000}, 'ago2_'+ano, false);
Map.addLayer(bioma_set_1.clip(corte), {bands: bands, min: 300, max:6000}, 'set1_'+ano, false);
Map.addLayer(bioma_set_2.clip(corte), {bands: bands, min: 300, max:6000}, 'set2_'+ano, false); 
Map.addLayer(bioma_out_1.clip(corte), {bands: bands, min: 300, max:6000}, 'out1_'+ano, false);
Map.addLayer(bioma_out_2.clip(corte), {bands: bands, min: 300, max:6000}, 'out2_'+ano, false);
Map.addLayer(bioma_nov_1.clip(corte), {bands: bands, min: 300, max:6000}, 'nov1_'+ano, false);
Map.addLayer(bioma_nov_2.clip(corte), {bands: bands, min: 300, max:6000}, 'nov2_'+ano, false);
Map.addLayer(bioma_dez_1.clip(corte), {bands: bands, min: 300, max:6000}, 'dez1_'+ano, false);
Map.addLayer(bioma_dez_2.clip(corte), {bands: bands, min: 300, max:6000}, 'dez2_'+ano, false);


var mnosaic = ee.ImageCollection([
  bioma_dez_1.select('B6','B5','B4')
  ]).mosaic();

var mosaico = mnosaic.clip(area_analise);

Map.addLayer(mosaico, {bands: bands, min: 300, max:6000}, 'mosaico');

var empty = ee.Image().byte();

var outline = empty.paint({
  featureCollection: area_estudo,
  color: 1,
  width: 3
});
Map.addLayer(outline, {palette: 'FF0000'}, 'area_estudo');


Export.image.toDrive({
    image: mosaico,
    folder: 'mapiaeng/isa/',
    region: corte, 
    scale: 30, 
    description: 'area_analise_imoveis_bacia_lansat_' + mes + '_' + ano
  });

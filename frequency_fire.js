var palettes = require('users/gena/packages:palettes');

var palette = palettes.colorbrewer.YlOrRd[9];

var fire_2008 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2008").select('b1'),
    fire_2009 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2009").select('b1').unmask(),
    fire_2010 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2010").select('b1'),
    fire_2011 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2011").select('b1'),
    fire_2012 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2012").select('b1'),
    fire_2013 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2013").select('b1'),
    fire_2014 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2014").select('b1'),
    fire_2015 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2015").select('b1'),
    fire_2016 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2016").select('b1'),
    fire_2017 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2017").select('b1'),
    fire_2018 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2018").select('b1'),
    fire_2019 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2019").select('b1'),
    fire_2020 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2020").select('b1'),
    fire_2021 = ee.Image("users/scripts_MapiaEng/ISA/fire/fire_2021").select('b1');

var frequency =   fire_2008
                    .add(fire_2009)
                    .add(fire_2010)
                    .add(fire_2011)
                    .add(fire_2012)
                    .add(fire_2013)
                    .add(fire_2014)
                    .add(fire_2015)
                    .add(fire_2016)
                    .add(fire_2017)
                    .add(fire_2018)
                    .add(fire_2019)
                    .add(fire_2020)
                    .add(fire_2021);

Map.addLayer(fire_2008, '', 'fire_2008', false);
Map.addLayer(fire_2009, '', 'fire_2009', false);
Map.addLayer(fire_2010, '', 'fire_2010', false);
Map.addLayer(fire_2011, '', 'fire_2011', false);
Map.addLayer(fire_2012, '', 'fire_2012', false);
Map.addLayer(fire_2013, '', 'fire_2013', false);
Map.addLayer(fire_2014, '', 'fire_2014', false);
Map.addLayer(fire_2015, '', 'fire_2015', false);
Map.addLayer(fire_2016, '', 'fire_2016', false);
Map.addLayer(fire_2017, '', 'fire_2017', false);
Map.addLayer(fire_2018, '', 'fire_2018', false);
Map.addLayer(fire_2019, '', 'fire_2019', false);
Map.addLayer(fire_2020, '', 'fire_2020', false);
Map.addLayer(fire_2021, '', 'fire_2021', false);

Map.addLayer(frequency.selfMask(), {min: 1, max: 14, palette: palette}, 'Frequency');

Export.image.toAsset({
  image:frequency,
  description:'frequency_2008_2021',
  assetId:'users/scripts_MapiaEng/ISA/fire/frequency_2008_2021',
  region: geometry,
  scale:30,
  maxPixels: 1e13
});

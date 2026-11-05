// Run after Hugo build. Produces a portable HTML file with no network dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateData } from '../assets/docs/js/delivery-map-model.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const build=path.join(root,'reports/delivery-map-build');
let html=fs.readFileSync(path.join(build,'mapa-delivery/index.html'),'utf8');
const localAsset=url=>{
  const file=path.resolve(build,'.'+new URL(url,'https://kurierpedia.pl').pathname);
  if(!file.startsWith(build+path.sep))throw new Error('Asset outside build');
  return fs.readFileSync(file,'utf8');
};
let styles=0,scripts=0;
html=html.replace(/<link\s+rel=["']?stylesheet["']?\s+href=["']?([^"'\s>]+)["']?[^>]*>/g,(_,url)=>{styles++;return '<style>'+localAsset(url)+'</style>';});
html=html.replace(/<script\s+src=["']?([^"'\s>]+)["']?[^>]*><\/script>/g,(_,url)=>{scripts++;return '<script>'+localAsset(url).replace(/<\/script/gi,'<\\/script')+'</script>';});
if(styles!==1||scripts!==1)throw new Error('Expected exactly one stylesheet and one script');
const data=validateData(JSON.parse(fs.readFileSync(path.join(root,'static/data/delivery-map.json'),'utf8')));
const geography=JSON.parse(fs.readFileSync(path.join(root,'static/data/poland-map.geojson'),'utf8'));
const bundle=JSON.stringify({data,geography}).replace(/</g,'\\u003c');
html=html.replace('</head>',()=>'<script type="application/json" id="delivery-map-bundle">'+bundle+'</script></head>');
html=html.replace(/href=["']?\/docs\/["']?/g,'href="https://kurierpedia.pl/docs/"');
const output=path.join(root,'reports/mapa-delivery.html');fs.writeFileSync(output,html);
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),cities:data.cities.length}));

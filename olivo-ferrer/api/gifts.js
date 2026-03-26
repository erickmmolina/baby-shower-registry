import { getRedis, key, cors } from './_helpers.js';

const defaultGifts = [
  { id:1, cat:"accesorios", name:"Mochila Mudador Backpack Carbono", store:"Infanti", description:"Mochila multifuncional con cambiador, bolsillo térmico, porta chupete y 6 compartimentos. Perfecta para salidas.", price:34990, link1:"https://infanti.cl/collections/bolsos-maternales-y-mudadores/products/mochila-mudador-backpack-carbono", priority:"alta", status:"Disponible", claimedBy:null, images:[] },
  { id:2, cat:"accesorios", name:"Mochila Portabebé Azul", store:"Carestino", description:"Portabebé ergonómico en 3 posiciones: frente, cadera y espalda. Faja lumbar y tela airmesh ventilada. Hasta 15 kg.", price:49990, link1:"https://www.carestino.cl/producto/mochila-porta-bebe-azul/", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:3, cat:"accesorios", name:"Alfombra Antigolpes Plegable 180x200 Números", store:"Carestino", description:"Alfombra reversible de espuma de alta densidad. Resistente al agua, con diseño didáctico de números. 180x200 cm.", price:69990, link1:"https://www.carestino.cl/producto/alfombra-antigolpes-reversible-plegable-180x200-numeros/", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:4, cat:"higiene", name:"Lima de Uñas Eléctrica para Bebé", store:"MercadoLibre", description:"Cortaúñas eléctrico recargable 2 en 1, silencioso y seguro para recién nacidos. Incluye 6 cabezales.", price:9990, link1:"https://articulo.mercadolibre.cl/MLC-2876748764", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:5, cat:"higiene", name:"2 Chupetes Reversibles Silicona 0+", store:"Infanti", description:"Chupetes de silicona ecológica con tetina reversible simétrica. Ideales desde el nacimiento. Pack x2.", price:8990, link1:"https://infanti.cl/collections/chupete-y-porta-chupete/products/2-chupetes-reversibles-silicona-0-azul-arena-bebe-confort", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:6, cat:"higiene", name:"Adaptador de Baño", store:"Opaline", description:"Reductor de WC para bebé con agarre seguro. Facilita el aprendizaje del baño de forma cómoda y segura.", price:12990, link1:"https://www.opaline.cl/adaptador-bano/p?skuId=19458", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:7, cat:"ropa", name:"Osito Azul de Algodón Bebé Niño", store:"Opaline", description:"Osito enterito de algodón suave en azul. Diseño abrigado perfecto para invierno. Tallas RN a 6M.", price:19990, link1:"https://www.opaline.cl/osito-azul-de-algodon-de-bebe-nino/p?skuId=19057", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:8, cat:"ropa", name:"Osito Azul con Apertura en la Espalda", store:"Opaline", description:"Osito abrigado con práctica apertura en espalda para cambios fáciles. Ideal invierno 0-6M.", price:19990, link1:"https://www.opaline.cl/osito-azul-con-apertura-en-la-espalda-de-bebe-nino/p?skuId=19090", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:9, cat:"ropa", name:"Saco de Dormir Bebé Niño Carter's", store:"Falabella", description:"Saco de dormir suave y abrigado para bebé. Diseño para niño con cierre frontal. Seguro para la cuna.", price:24990, link1:"https://www.falabella.com/falabella-cl/product/17563797/Saco-De-Dormir-Bebe-Nino-Carters/17563798", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:10, cat:"ropa", name:"Saco de Dormir Bebé Niño", store:"Opaline", description:"Saco de dormir suave para bebé niño. Ideal para mantener abrigado durante la noche sin riesgo de destape.", price:22990, link1:"https://www.opaline.cl/saco-de-dormir-de-nino/p?skuId=18461", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:11, cat:"ropa", name:"Enterito Sherpa Manga Larga Carter's", store:"Falabella", description:"Enterito unisex de sherpa suave manga larga. Abrigado y cómodo para los primeros meses de invierno.", price:19990, link1:"https://www.falabella.com/falabella-cl/product/17483989/Enterito-Sherpa-Manga-Larga-Bebe-Unisex-Carters/17483990", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:12, cat:"ropa", name:"Parka Sin Mangas Bebé Yamp", store:"Falabella", description:"Parka chaleco bebé sin mangas, abrigada y liviana. Ideal para usar sobre otra ropa en días fríos.", price:14990, link1:"https://www.falabella.com/falabella-cl/product/883618338/parka-sin-mangas-bebe-yamp/883618339", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:13, cat:"ropa", name:"Conjunto 2 Piezas Polerón y Pantalón Carter's", store:"Falabella", description:"Conjunto 2 piezas de buzo con polerón y pantalón para bebé niño. Tela suave y cómoda para el día a día.", price:24990, link1:"https://www.falabella.com/falabella-cl/product/17484607/Conjunto-2-Piezas-Poleron-y-Pantalon-Buzo-Bebe-Nino-Carters/17484608", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:14, cat:"ropa", name:"Conjunto 3 Piezas Chaqueta Sherpa Carter's", store:"Falabella", description:"Set completo chaqueta sherpa + pantalón + body para bebé niño. Perfecto para días de frío.", price:34990, link1:"https://www.falabella.com/falabella-cl/product/17484062/Conjunto-3-Piezas-Chaqueta-Sherpa-Pantalon-y-Body-Bebe-Nino-Carters/17484063", priority:"alta", status:"Disponible", claimedBy:null, images:[] },
  { id:15, cat:"ropa", name:"Ropa Bebé Niño Invierno 0-6M", store:"H&M", description:"Conjunto abrigado de invierno para bebé niño. Materiales suaves y seguros para piel sensible. Tallas 0 a 6 meses.", price:15990, link1:"https://cl.hm.com/1022957027-828/p", priority:"alta", status:"Disponible", claimedBy:null, images:[] },
  { id:16, cat:"ropa", name:"Set Prendas Bebé H&M", store:"H&M", description:"Set de prendas de algodón suave para bebé. Diseños tiernos y colores neutros. Tallas recién nacido.", price:12990, link1:"https://cl.hm.com/0880118061-6534/p", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:17, cat:"ropa", name:"Body / Pieza H&M Bebé", store:"H&M", description:"Body de algodón suave para bebé. Broches en la parte inferior para cambios fáciles. Tallas RN-6M.", price:9990, link1:"https://cl.hm.com/1265824004-28783/p", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:18, cat:"dormitorio", name:"Cobertor de Cuna Estampado 90x140 cm", store:"Casa Ideas", description:"Suave cobertor de cuna estampado 90x140 cm. Ideal para mantener abrigado al bebé en su cuna.", price:14990, link1:"https://www.casaideas.cl/producto/3228295000049-cobertor-de-cuna-estampado-90x140-cm.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:19, cat:"dormitorio", name:"Almohada Hipoalergénica para Cuna 45x30 cm", store:"Casa Ideas", description:"Almohada hipoalergénica especial para cuna 45x30 cm. Material seguro para bebé, lavable.", price:9990, link1:"https://www.casaideas.cl/producto/3113392000019-almohada-hipoalegenica-para-cuna-45x30-cm.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:20, cat:"dormitorio", name:"Sonajero de Bebé", store:"Casa Ideas", description:"Sonajero colorido y estimulante para bebé. Material suave y seguro. Diseño apto para recién nacidos.", price:4990, link1:"https://www.casaideas.cl/producto/3226848000058-sonajero-de-bebe.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:21, cat:"higiene", name:"Capas de Baño Niño Azul", store:"Opaline", description:"Set de capas de baño suaves en azul para bebé niño. Con capucha y diseño absorbente. Talla única.", price:24990, link1:"https://www.opaline.cl/capas-de-bano-de-nino-azul/p?skuId=19396", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:22, cat:"higiene", name:"Capa de Baño Bebé Niño", store:"Opaline", description:"Capa de baño esponjosa con capucha para bebé niño. Tela suave y absorbente, ideal post-baño.", price:19990, link1:"https://www.opaline.cl/capa-de-bano-de-nino/p?skuId=17402", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:23, cat:"alimentacion", name:'Set Bebé "Mi Primera Comida"', store:"Casa Ideas", description:"Set que incluye babero y plato con divisiones de silicona + dos cucharas de silicona y madera. Libre de BPA.", price:12990, link1:"https://www.casaideas.cl/producto/3230009000030-set-para-bebe-mi-primera-comida.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:24, cat:"alimentacion", name:"Plato Infantil con Divisiones de Fibra de Bambú", store:"Casa Ideas", description:"Plato con divisiones de fibra de bambú para bebé. Ecológico, resistente y apto para alimentos.", price:6990, link1:"https://www.casaideas.cl/producto/3229870000010-plato-infantil-con-divisiones-de-fibra-de-bambu.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:25, cat:"alimentacion", name:"Plato Animalito con Divisiones para Bebé", store:"Casa Ideas", description:"Plato con forma de animalito y divisiones para bebé 22.5x15.5 cm. Diseño divertido, libre de BPA.", price:5990, link1:"https://www.casaideas.cl/producto/3227271000059-plato-animalito-con-divisiones-para-bebe-22-5x15-5x3-3-cm.html", priority:null, status:"Disponible", claimedBy:null, images:[] },
  { id:26, cat:"alimentacion", name:"Set 2 Cucharas de Silicona Bebé", store:"Casa Ideas", description:"Set de 2 cucharas suaves de silicona para bebé 3x15.5 cm. Ideales para primeras comidas, sin BPA.", price:3990, link1:"https://www.casaideas.cl/producto/3225660000086-set-2-cucharas-de-silicona-bebe-3x1-3x15-5-cm.html", priority:null, status:"Disponible", claimedBy:null, images:[] }
];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    let gifts = data ? JSON.parse(data) : null;

    if (!gifts) {
      await redis.set(key('gifts'), JSON.stringify(defaultGifts));
      gifts = defaultGifts;
    }

    return res.status(200).json(gifts);
  } catch (error) {
    console.error('Error obteniendo regalos:', error);
    return res.status(500).json({ error: 'Error al obtener los regalos' });
  }
}

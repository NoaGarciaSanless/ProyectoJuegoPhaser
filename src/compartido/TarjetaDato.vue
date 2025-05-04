<script setup lang="ts">
import * as PIXI from 'pixi.js';
import { onMounted, onBeforeUnmount, ref } from 'vue';

import { EnemigoDTO } from '../DTOs/EnemigoDTO';
import { MejoraDTO } from '../DTOs/MejoraDTO';
import { PersonajeDTO } from '../DTOs/PersonajeDTO';

// Props
const props = defineProps<{
    dato: PersonajeDTO | EnemigoDTO | MejoraDTO
}>();

// Variables
const tipo = props.dato.constructor.name;
const contenedorSprite = ref<HTMLDivElement | null>(null);
let app: PIXI.Application<PIXI.Renderer> | null = null;

// Convierte el formato json que crea Aseprite al que necisat PIXI
function convertirAsepriteAPixi(json: any): any {
    if (!json.meta?.frameTags || !Array.isArray(json.meta.frameTags)) {
        console.warn('No se han encontrado animaciones');
        return json;
    }

    const animations: { [key: string]: string[] } = {};
    const frameKeys = Object.keys(json.frames);

    json.meta.frameTags.forEach((tag: { name: string; from: number; to: number }) => {
        const frameNames = frameKeys.slice(tag.from, tag.to + 1);
        if (frameNames.length > 0) {
            animations[tag.name] = frameNames;
        }
    });

    return {
        ...json,
        animations,
    };
}


onMounted(async () => {
    app = new PIXI.Application();
    await app.init({ 
        width: 100, 
        height: 150, 
        backgroundAlpha: 0, 
        resolution: 1 });
     contenedorSprite.value?.appendChild(app.canvas);

    // Obtine la imagen y el json de datos de la imagen, si no estan vacios crea la habitación
    if (props.dato.urlSprites != "" && props.dato.urlJSON != "") {

        try {
            // Carga las imagenes con PIXI y el json con fetch
            const [texture, jsonAnims] = await Promise.all([
                PIXI.Assets.load(props.dato.urlSprites),
                fetch(props.dato.urlJSON).then(res => res.json()),
            ]);

            // Ajusta el sprite para que se vea nítido
            texture.source.scaleMode = 'nearest';

            // Transforma el json para que lo pueda utilizar PIXI
            const pixiJson = convertirAsepriteAPixi(jsonAnims);

            const jsonCorregido = {
                ...pixiJson,
                meta: {
                    ...pixiJson.meta,
                    image: props.dato.urlSprites,
                },
            };

            // Crea el spritesheet
            const sheet = new PIXI.Spritesheet(texture, jsonCorregido);
            await sheet.parse()

            // Animación si el objeto recibido es un personaje o enemigo, o una imagen si es una mejora o un objeto
            if (tipo == "PersonajeDTO" || tipo == "EnemigoDTO") {
                const anim = new PIXI.AnimatedSprite(sheet.animations['Idle']);
                anim.anchor.set(0.5);
                anim.x = app.screen.width / 2;
                anim.y = app.screen.height / 2;
                anim.animationSpeed = 0.05;
                anim.scale.set(3, 3);
                anim.play();

                app.stage.addChild(anim);
            } else {
                let imagen = new PIXI.Sprite(sheet.textures[0]);
                imagen.anchor.set(0.5);
                imagen.x = app.screen.width / 2;
                imagen.y = app.screen.height / 2;
                app.stage.addChild(imagen);
            }

        } catch (error) {
            console.error('Ha ocurrido un error:', error);
        }

    } else {
        console.log("Sin imagen o json para la imagen");

    }


})

onBeforeUnmount(() => {
    // Limpiar recursos al desmontar el componente
    if (app) {
        app.destroy(true, { children: true, texture: true });
        app = null;
    }
});

</script>


<template>
    <div class="tarjeta">
        <h3>{{ dato.nombre }}</h3>
        <div class="contenedorSprite" ref="contenedorSprite"> </div>

        <div class="datos">
            <h4>Descripción</h4>
            <p>{{ dato.descripcion }}</p>
        </div>
    </div>

</template>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');

.tarjeta {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;

    height: fit-content;
    width: fit-content;


    border: 1px solid black;
    border-radius: 10px;

    padding: 10px;
    margin: 10px8;


}

.contenedorSprite {
    width: 100px;
    height: 150px;
}

.datos{
    width: 100%;
}
</style>
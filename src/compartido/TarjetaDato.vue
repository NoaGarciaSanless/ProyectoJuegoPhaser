<script setup lang="ts">
import * as PIXI from "pixi.js";
import { onMounted, onBeforeUnmount, ref } from "vue";

import { EnemigoDTO } from "../DTOs/EnemigoDTO";
import { MejoraDTO } from "../DTOs/MejoraDTO";
import { PersonajeDTO } from "../DTOs/PersonajeDTO";

// Props -------------------------------------
const props = defineProps<{
    dato: PersonajeDTO | EnemigoDTO | MejoraDTO;
}>();

// Emits -------------------------------------

const emits = defineEmits(["mostrarDetalles"]);

// Variables ---------------------------------

// Obtiene el tipo de elemento que se mostrará
const tipo = props.dato.constructor.name;
// Verifica que el elemneto tenga una imagen disponible
const conImagen = props.dato.spriteURL != "" ? true : false;

// El contenedor sobre el que se construirá la imagen
const contenedorSprite = ref<HTMLDivElement | null>(null);

// Imagen con animación
let app: PIXI.Application<PIXI.Renderer> | null = null;

// Funciones ---------------------------------

// Convierte el formato json que crea Aseprite al que necisat PIXI
function convertirAsepriteAPixi(json: any): any {
    if (!json.meta?.frameTags || !Array.isArray(json.meta.frameTags)) {
        console.warn("No se han encontrado animaciones", json.meta);
        return json;
    }

    const animations: { [key: string]: string[] } = {};
    const frameKeys = Object.keys(json.frames);

    json.meta.frameTags.forEach(
        (tag: { name: string; from: number; to: number }) => {
            const frameNames = frameKeys.slice(tag.from, tag.to + 1);
            if (frameNames.length > 0) {
                animations[tag.name] = frameNames;
            }
        }
    );

    return {
        ...json,
        animations,
    };
}

// Devuelve el string de la descripción recortado
function recortarDescripcion() {
    let descripcionOriginal = props.dato.descripcion;

    // Si hay descripción
    if (descripcionOriginal) {
        // Si tiene menos de 60 caractéres devuelve el original, si no lo transforma
        if (descripcionOriginal.length <= 60) {
            return descripcionOriginal;
        } else {
            let descripcionTransformada = descripcionOriginal
                .slice(0, 57)
                .concat("...");

            return descripcionTransformada;
        }
    }
}

// Hooks de VUE ------------------------------
// Cuando se crea el componente, se crea la imagen con la animación
onMounted(async () => {
    app = new PIXI.Application();
    await app.init({
        width: 100,
        height: 150,
        backgroundAlpha: 0,
        resolution: 1,
    });
    contenedorSprite.value?.appendChild(app.canvas);

    // Obtine la imagen y el json de datos de la imagen, si no estan vacios crea la imagen
    if (props.dato.spriteURL != "" && props.dato.jsonURL != "") {
        try {
            // Comprueba si existe la imagen, si existe simplemente la carga si no la recoge del servidor
            let texture: PIXI.Texture;
            if (PIXI.Assets.cache.has(props.dato.spriteURL)) {
                texture = PIXI.Assets.get(props.dato.spriteURL);
            } else {
                texture = await PIXI.Assets.load(props.dato.spriteURL);
            }

            // Recoge el json con los datos de animación
            const jsonAnims = await fetch(props.dato.jsonURL).then((res) =>
                res.json()
            );
            // Transforma el json para que lo pueda utilizar PIXI
            const pixiJson = convertirAsepriteAPixi(jsonAnims);

            // Ajusta el sprite para que se vea nítido
            texture.source.scaleMode = "nearest";

            const jsonCorregido = {
                ...pixiJson,
                meta: {
                    ...pixiJson.meta,
                    image: props.dato.spriteURL,
                },
            };

            // Crea el spritesheet
            const sheet = new PIXI.Spritesheet(texture, jsonCorregido);
            await sheet.parse();

            // Animación si el objeto recibido es un personaje o enemigo, o una imagen si es una mejora o un objeto
            // if (tipo == "PersonajeDTO" || tipo == "EnemigoDTO") {
            if (tipo != "MejoraDTO") {
                let anim: PIXI.AnimatedSprite;

                // Escoge la animación
                anim = new PIXI.AnimatedSprite(sheet.animations["Idle_derch"]);

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
            console.error("Ha ocurrido un error:", error);
        }
    } else {
        console.log("Sin imagen o json para la imagen");
    }
});

// Cuando se elimina el componente se limpia la imagen con la animación
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
        <h3 class="nombre">{{ dato.nombre }}</h3>
        <div class="contenedorSprite" ref="contenedorSprite">
            <span v-if="!conImagen">
                No hay un sprite disponible para mostrar</span
            >
        </div>

        <div class="datos">
            <p class="titulo">Descripción</p>
            <p>{{ recortarDescripcion() }}</p>
            <button class="verBTN" @click="$emit('mostrarDetalles', dato)">
                Ver detalles
            </button>
        </div>
    </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Pixelify+Sans:wght@400..700&display=swap");

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

.nombre {
    font-family: "MyCustomFont", sans-serif;
    font-size: 0.9em;
}

.contenedorSprite {
    width: 100px;
    height: 150px;
}

/* Estilos de la información adicional */
.datos {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 5px;
}

.datos .titulo {
    font-family: "MyCustomFont", sans-serif;

    margin: 0;
    padding: 0;

    font-size: large;
    font-weight: bold;
}

.datos p {
    font-family: "Pixelify Sans", sans-serif;

    margin: 0;
    padding: 0;

    margin-left: 10px;
}

.datos button {
    width: 60%;

    margin-right: 10px;
    margin-top: 10px;

    align-self: flex-end;
}

.verBTN {
    cursor: pointer;

    font-size: 0.9em;

    background-color: #e2c16b;
    border: #e2c16b;
    border-radius: 5px;

    padding: 2px;
}

.verBTN:hover {
    background-color: #e7ca81;
}
</style>


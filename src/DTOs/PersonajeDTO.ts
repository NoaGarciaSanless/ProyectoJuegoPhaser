export class PersonajeDTO {
    public id: string;
    public nombre: string;
    public descripcion: string;

    public ataqueBase: number;
    public ataquePorNivel: number;

    public defensaBase: number;
    public defensaPorNivel: number;

    public ataqueMagicoBase: number;
    public ataqueMagicoPorNivel: number;

    public precisionBase: number;
    public criticoBase: number;

    public debilidad: string;
    public fortaleza: string;

    public tipoAtaquePrincipal: string;

    public habilidades: string[];

    public spriteURL: string;
    public jsonURL: string;

    public constructor(
        id?: string,
        nombre?: string,
        descripcion?: string,
        ataqueBase?: number,
        ataquePorNivel?: number,
        defensaBase?: number,
        defensaPorNivel?: number,
        ataqueMagicoBase?: number,
        ataqueMagicoPorNivel?: number,
        precisionBase?: number,
        criticoBase?: number,
        debilidad?: string,
        fortaleza?: string,
        tipoAtaquePrincipal?: string,
        habilidades?: string[],
        urlSprites?: string,
        urlJSON?: string
    ) {
        this.id = id || "";
        this.nombre = nombre || "";
        this.descripcion = descripcion || "";

        this.ataqueBase = ataqueBase || 0;
        this.ataquePorNivel = ataquePorNivel || 0;

        this.defensaBase = defensaBase || 0;
        this.defensaPorNivel = defensaPorNivel || 0;

        this.ataqueMagicoBase = ataqueMagicoBase || 0;
        this.ataqueMagicoPorNivel = ataqueMagicoPorNivel || 0;

        this.precisionBase = precisionBase || 0;
        this.criticoBase = criticoBase || 0;

        this.debilidad = debilidad || "";
        this.fortaleza = fortaleza || "";

        this.tipoAtaquePrincipal = tipoAtaquePrincipal || "fisico";

        this.habilidades = habilidades || [];

        this.spriteURL = urlSprites || "";
        this.jsonURL = urlJSON || "";
    }

    aObjetoJS() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,

            ataqueBase: this.ataqueBase,
            ataquePorNivel: this.ataquePorNivel,

            defensaBase: this.defensaBase,
            defensaPorNivel: this.defensaPorNivel,

            ataqueMagicoBase: this.ataqueMagicoBase,
            ataqueMagicoPorNivel: this.ataqueMagicoPorNivel,

            precisionBase: this.precisionBase,
            criticoBase: this.criticoBase,

            debilidad: this.debilidad,
            fortaleza: this.fortaleza,

            tipoAtaquePrincipal: this.tipoAtaquePrincipal,

            habilidades: this.habilidades,

            urlSprites: this.spriteURL,
            urlJSON: this.jsonURL,
        };
    }
}

// Clase de la lista de Personajes que tienen los usuarios
export class ElementoListaPersonajesDTO {
    public id: string;
    public personajeID: number;
    public experiencia: number;
    public nivel: number;

    public seleccionado: boolean;

    public constructor(
        id?: string,
        personajeID?: number,
        experiencia?: number,
        nivel?: number,
        seleccionado?: boolean
    ) {
        this.id = id || "";
        this.personajeID = personajeID || 0;
        this.experiencia = experiencia || 0;
        this.nivel = nivel || 0;
        this.seleccionado = seleccionado || false;
    }

    aObjetoJS() {
        return {
            id: this.id,
            personajeID: this.personajeID,
            experiencia: this.experiencia,
            nivel: this.nivel,
            seleccionado: this.seleccionado,
        };
    }
}

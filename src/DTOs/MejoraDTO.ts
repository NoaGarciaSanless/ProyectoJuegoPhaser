export class MejoraDTO {
    public id: string;
    public nombre: string;
    public estadisticaMejorada: string;
    public descripcion: string;

    public cantidadBase: number;
    public cantidadPorNivel: number;

    public spriteURL: string;
    public jsonURL: string;

    public constructor(
        id?: string,
        nombre?: string,
        estadisticaMejorada?: string,
        descripcion?: string,
        cantidadBase?: number,
        cantidadPorNivel?: number,
        urlSprites?: string,
        urlJSON?: string
    ) {
        this.id = id || "";
        this.nombre = nombre || "";
        this.estadisticaMejorada = estadisticaMejorada || "";
        this.descripcion = descripcion || "";

        this.cantidadBase = cantidadBase || 0;
        this.cantidadPorNivel = cantidadPorNivel || 0;

        this.spriteURL = urlSprites || "";
        this.jsonURL = urlJSON || "";
    }

    aObjetoJS() {
        return {
            id: this.id,
            nombre: this.nombre,
            estadisticaMejorada: this.estadisticaMejorada,
            descripcion: this.descripcion,

            cantidadBase: this.cantidadBase,
            cantidadPorNivel: this.cantidadPorNivel,

            urlSprites: this.spriteURL,
            urlJSON: this.jsonURL,
        };
    }
}

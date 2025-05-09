// Objeto en el inventario
export interface IObjeto {
    nombre: string;
    imagen: string;
    cantidad: number;
    descripcion?: string;   
    efecto?: (target: any) => void;
}

export class ObjetoDTO {
    public id: string;
    public nombre: string;
    public descripcion: string;

    public tipo: string;

    public spriteURL: string;
    public jsonURL: string;

    public constructor(
        id?: string,
        nombre?: string,
        descripcion?: string,
        tipo?:string,
        urlSprites?: string,
        urlJSON?: string
    ) {
        this.id = id || "";
        this.nombre = nombre || "";
        this.descripcion = descripcion || "";
        this.tipo = tipo || "";
        this.spriteURL = urlSprites || "";
        this.jsonURL = urlJSON || "";
    }

    aObjetoJS() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            tipo: this.tipo,
            urlSprites: this.spriteURL,
            urlJSON: this.jsonURL,
        };
    }
}


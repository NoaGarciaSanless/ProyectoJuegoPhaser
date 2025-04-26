export class UsuarioDTO {
    public id: string;
    public nombre: string;
    public correo: string;
    public tipo: string;

    public constructor(
        id?: string,
        nombre?: string,
        correo?: string,
        tipo?: string
    ) {
        this.id = id || "";
        this.nombre = nombre || "";
        this.correo = correo || "";
        this.tipo = tipo || "";
    }

    aObjetoJS() {
        return {
            uid: this.id,
            nombre: this.nombre,
            correo: this.correo,
            tipo: this.tipo,
            fechaRegistro: new Date(),
        };
    }
}

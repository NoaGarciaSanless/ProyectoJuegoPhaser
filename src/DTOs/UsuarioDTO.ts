export class UsuarioDTO{
    public id: string;
    public nombre: string;
    public correo: string;
    public contrasenha: string;


    public constructor(id?:string,nombre?:string, correo?:string, contra?:string){
        this.id = id || "";
        this.nombre = nombre || "";
        this.correo = correo || "";
        this.contrasenha = contra || "";
    }

    toPlainObject() {
        return {
            uid: this.id,
            nombre: this.nombre,
            correo: this.correo,
            contrasenha: this.contrasenha,
            fechaRegistro: new Date(),
        };
    }
}
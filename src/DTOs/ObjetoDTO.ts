// Objeto en el inventario
export interface ObjetoDTO {
    nombre: string;
    imagen: string;
    cantidad: number;
    descripcion?: string;   
    efecto?: (target: any) => void;
}

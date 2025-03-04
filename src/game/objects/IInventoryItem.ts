// Inventoy item class
export interface IInventoryItem {
    name: string;
    texture: string;
    quantity: number;
    description?: string;   
    effect?: (target: any) => void;
}

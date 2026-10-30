import { useState } from "react";
export default function useContent(initial = []) { const [materials, setMaterials] = useState(initial); return { materials, addMaterial: material => setMaterials(items => [{ id: Date.now(), ...material }, ...items]), removeMaterial: id => setMaterials(items => items.filter(item => item.id !== id)) }; }

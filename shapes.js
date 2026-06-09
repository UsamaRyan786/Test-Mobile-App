export const BASIC_SHAPES = [
  { id: 0, name: "Circle", emoji: "⭕", sides: 0, group: "round" },
  { id: 1, name: "Square", emoji: "🟧", sides: 4, group: "corners" },
  { id: 2, name: "Triangle", emoji: "🔺", sides: 3, group: "corners" },
  { id: 3, name: "Rectangle", emoji: "🟦", sides: 4, group: "corners" },
  { id: 4, name: "Star", emoji: "⭐", sides: 10, group: "corners" },
  { id: 5, name: "Heart", emoji: "❤️", sides: 0, group: "round" },
  { id: 6, name: "Oval", emoji: "🥚", sides: 0, group: "round" },
  { id: 7, name: "Diamond", emoji: "🔷", sides: 4, group: "corners" }
];

export function getShapeById(id) {
  return BASIC_SHAPES.find((shape) => shape.id === id) || BASIC_SHAPES[0];
}

export function getShapeName(id) {
  return getShapeById(id).name;
}

// Simple test to check if the formation definitions work
const formationDefinitions = {
  "5-3-2": {
    positions: [
      { id: "gk", name: "GK", position: "GOALKEEPER", x: 50, y: 90 },
      { id: "lwb", name: "LWB", position: "DEFENDER", x: 15, y: 70 },
      { id: "cb1", name: "CB", position: "DEFENDER", x: 35, y: 70 },
      { id: "cb2", name: "CB", position: "DEFENDER", x: 50, y: 70 },
      { id: "cb3", name: "CB", position: "DEFENDER", x: 65, y: 70 },
      { id: "rwb", name: "RWB", position: "DEFENDER", x: 85, y: 70 },
      { id: "cm1", name: "CM", position: "MIDFIELDER", x: 35, y: 50 },
      { id: "cm2", name: "CM", position: "MIDFIELDER", x: 50, y: 50 },
      { id: "cm3", name: "CM", position: "MIDFIELDER", x: 65, y: 50 },
      { id: "st1", name: "ST", position: "ATTACKER", x: 40, y: 30 },
      { id: "st2", name: "ST", position: "ATTACKER", x: 60, y: 30 }
    ]
  }
};

const selectedFormation = "5-3-2";
const positions = formationDefinitions[selectedFormation]?.positions || [];

console.log("Formation:", selectedFormation);
console.log("Positions count:", positions.length);
console.log("Positions:", positions.map(p => `${p.id}: ${p.name}`));

// Test if positions exist
if (positions.length === 0) {
  console.error("No positions found!");
} else {
  console.log("✅ Formation definitions work correctly");
}

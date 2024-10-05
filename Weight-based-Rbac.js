const express = require('express');
const app = express();
app.use(express.json());

// In-memory data structure for members
let members = [
  { id: 1, name: "Alice", membershipType: "premium", timeSlot: "Anytime", proteinBox: true, weight: 3 },
  { id: 2, name: "Bob", membershipType: "normal", timeSlot: "10:00-11:00", proteinBox: false, weight: 1 },
  { id: 3, name: "Charlie", membershipType: "gold", timeSlots: ["08:00-09:00", "18:00-19:00"], proteinBox: false, weight: 2 },
  { id: 4, name: "Dave", membershipType: "premium", timeSlot: "Anytime", proteinBox: true, weight: 3 },
];

// In-memory data structure for subscription plans
let subscriptions = [
  { id: 1, memberId: 1, plan: "yearly" },
  { id: 2, memberId: 2, plan: "monthly" },
  { id: 3, memberId: 3, plan: "quarterly" },
];

// Middleware to check gym access based on member attributes using weight
const checkAccess = (req, res, next) => {
  const { memberId } = req.params;
  const member = members.find(m => m.id === parseInt(memberId));
  
  if (!member) return res.status(404).json({ message: "Member not found" });

  const today = new Date();
  const day = today.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday

  // Gym closed on Sundays
  if (day === 0) {
    return res.status(403).json({ message: "The gym is closed on Sundays." });
  }

  // Calculate access level based on membership weight
  if (member.weight < 3 && member.timeSlot === "Anytime") {
    return res.status(403).json({ message: "Normal members have a fixed time slot." });
  }

  next();
};

// Route for members to access the gym
app.post('/members/:memberId/access', checkAccess, (req, res) => {
  const { memberId } = req.params;
  const member = members.find(m => m.id === parseInt(memberId));
  
  if (member.weight === 3) {
    return res.json({ message: `${member.name}, you can access the gym anytime!` });
  } else if (member.weight === 2) {
    return res.json({ message: `${member.name}, you can access the gym in the slots: ${member.timeSlots.join(', ')}.` });
  } else if (member.weight === 1) {
    return res.json({ message: `${member.name}, you can access the gym at your time slot: ${member.timeSlot}.` });
  }
});

// Route for members to get their subscription details
app.get('/members/:memberId/subscription', (req, res) => {
  const { memberId } = req.params;
  const subscription = subscriptions.find(sub => sub.memberId === parseInt(memberId));

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }
  
  res.json(subscription);
});

// Route for premium members to get their protein box
app.get('/members/:memberId/protein-box', (req, res) => {
  const { memberId } = req.params;
  const member = members.find(m => m.id === parseInt(memberId));

  if (member.weight < 3) {
    return res.status(403).json({ message: "Only premium members receive protein boxes." });
  }

  res.json({ message: `${member.name}, you have received your 1 kg protein box!` });
});

// Port setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

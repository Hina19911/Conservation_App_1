module.exports = function () {
  return {
    reservations: [
      { id: 1, name: "Jane Doe", email: "jane@example.com", date: "2025-09-10", time: "10:00", partySize: 2, notes: "Wheelchair access", imageUrl: "/uploads/trail.png" },
      { id: 2, name: "Carlos Vega", email: "carlos@example.com", date: "2025-09-11", time: "13:30", partySize: 4, notes: "", imageUrl: "/uploads/lake.png" },
      { id: 3, name: "Nadine Harper", email: "nadine@example.com", date: "2025-09-13", time: "09:00", partySize: 3, notes: "Guided tour", imageUrl: "/uploads/bird.png" }
    ]
  };
}

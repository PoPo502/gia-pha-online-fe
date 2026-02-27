export const mockPersons = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    birthYear: 1986,
    deathYear: 2025,
    privacy: "public",
    branch: { name: "Nhánh 1" },
    note: "Dữ liệu demo để preview UI",
  },
  {
    id: "2",
    name: "Nguyễn Văn B",
    birthYear: 1960,
    privacy: "internal",
    branch: { name: "Nhánh 1" },
    note: "Dữ liệu demo để preview UI",
  },
  {
    id: "3",
    name: "Lê Thị Mai",
    birthYear: 2000,
    privacy: "public",
    branch: { name: "Nhánh 2" },
  },
  {
    id: "4",
    name: "Phạm Văn Hoàng",
    birthYear: 1945,
    deathYear: 2014,
    privacy: "sensitive",
    branch: { name: "Nhánh 3" },
  },
];

export function mockPersonById(id) {
  return mockPersons.find((p) => String(p.id) === String(id)) || {
    id: String(id),
    name: `Thành viên ${id}`,
    privacy: "public",
    branch: { name: "Nhánh" },
    note: "Dữ liệu demo",
  };
}

export function mockTree(id) {
  const root = mockPersonById(id);
  return {
    root: {
      ...root,
      children: [
        {
          ...mockPersonById("2"),
          children: [{ ...mockPersonById("3"), children: [] }],
        },
        { ...mockPersonById("4"), children: [] },
      ],
    },
  };
}

export const mockStreams = [
  { id: 1, title: "Lễ giỗ tổ họ Nguyễn 2026", user: "Nguyễn Văn Trưởng", status: "live", viewers: 124 },
  { id: 2, title: "Họp mặt con cháu phương xa", user: "Lê Hữu Cán", status: "ended", viewers: 45 },
];

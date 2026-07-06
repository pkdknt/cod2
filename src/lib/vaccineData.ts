export interface VaccineProtocol {
  id: string;
  vaccine: string;
  disease: string;
  object: string;
  schedule: string;
  route: string;
  sourceRow: number | string;
}

export const DATA = {
  protocols: [
    {
      id: "P2_0",
      vaccine: "Prevenar 13",
      disease:
        "PHẾ CẦU 13 ( Phòng viêm tai giữa, viêm phổi, viêm màng não, nhiễm trùng huyết,… của 13 chủng phế cầu khác nhau là 1,3, 4, 5, 6A, 7F, 9V, 14, 18C, 19A, 19F và 23F )",
      object: "Trẻ được 6 tuần đến dưới 7 tháng tuổi",
      schedule:
        "Mũi 1: Tiêm lần đầu\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 1 tháng sau mũi 2\nMũi 4: 8 tháng sau mũi 3",
      route:
        "Trẻ nhỏ: Tiêm bắp mặt trước bên đùi Trẻ lớn: Tiêm bắp cơ Delta cánh tay",
      sourceRow: 2,
    },
    {
      id: "P3_1",
      vaccine: "Prevenar 13",
      disease:
        "1.PHẾ CẦU 13 ( Phòng viêm tai giữa, viêm phổi, viêm màng não, nhiễm trùng huyết,… của 13 chủng phế cầu khác nhau là 1,3, 4, 5, 6A, 7F, 9V, 14, 18C, 19A, 19F và 23F )",
      object:
        "Từ 7 tháng đến dưới 12 tháng tuổi (chưa từng được tiêm trước đó)",
      schedule:
        "Mũi 1: Tiêm lần đầu\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 2",
      route:
        "Trẻ nhỏ: Tiêm bắp mặt trước bên đùi Trẻ lớn: Tiêm bắp cơ Delta cánh tay",
      sourceRow: 3,
    },
    {
      id: "P4_2",
      vaccine: "Prevenar 13",
      disease:
        "2.PHẾ CẦU 13 ( Phòng viêm tai giữa, viêm phổi, viêm màng não, nhiễm trùng huyết,… của 13 chủng phế cầu khác nhau là 1,3, 4, 5, 6A, 7F, 9V, 14, 18C, 19A, 19F và 23F )",
      object:
        "Từ 12 tháng đến 24 tháng tuổi (chưa từng được tiêm trước đó)",
      schedule: "Mũi 1: Tiêm lần đầu\nMũi 2: 2 tháng sau mũi 1",
      route:
        "Trẻ nhỏ: Tiêm bắp mặt trước bên đùi Trẻ lớn: Tiêm bắp cơ Delta cánh tay",
      sourceRow: 4,
    },
    {
      id: "P2_ADULT_PREVENAR13_ONE_DOSE",
      vaccine: "Prevenar 13",
      disease:
        "PHẾ CẦU 13 (Phòng viêm tai giữa, viêm phổi, viêm màng não, nhiễm trùng huyết,… do 13 chủng phế cầu)",
      object:
        "Người lớn khỏe mạnh chưa từng tiêm vắc xin phế cầu trước đây",
      schedule:
        "Mũi 1: Tiêm 1 mũi duy nhất vắc xin phế cầu 13 (Prevenar 13)\nNote: Không cần tiêm nhắc lại định kỳ",
      route:
        "Tiêm bắp, thường ở vùng cơ delta bắp tay",
      sourceRow: "Bổ sung",
    },
    {
      id: "P5_3",
      vaccine: "Abhayrab",
      disease: "1.Dại",
      object: "Người bình thường chưa tiêm",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 5,
    },
    {
      id: "P5_4",
      vaccine: " Abhayrab",
      disease: "2.Dại",
      object: "Suy giảm miễn dịch",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)\nMũi 5: 14 ngày sau mũi 4 (ngày 28)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 5,
    },
    {
      id: "P5_5",
      vaccine: "Abhayrab",
      disease: "3.Dại",
      object: "Đã tiêm trước đó",
      schedule: "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 5,
    },
    {
      id: "P5_6",
      vaccine: "Abhayrab",
      disease: "4.Dại",
      object: "Phơi nhiễm độ III (vết cắn chảy máu da/niêm mạc)",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 5,
    },
    {
      id: "P6_7",
      vaccine: "Indirad",
      disease: "1.Dại",
      object: "Người bình thường chưa tiêm",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 6,
    },
    {
      id: "P6_8",
      vaccine: " Indirad ",
      disease: "2.Dại",
      object: "Suy giảm miễn dịch",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)\nMũi 5: 14 ngày sau mũi 4 (ngày 28)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 6,
    },
    {
      id: "P6_9",
      vaccine: "Indirad",
      disease: "3.Dại",
      object: "Đã tiêm trước đó",
      schedule: "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 6,
    },
    {
      id: "P6_10",
      vaccine: "Indirad",
      disease: "4.Dại",
      object: "Phơi nhiễm độ III (vết cắn chảy máu da/niêm mạc)",
      schedule:
        "Mũi 1: Tiêm lần đầu (ngày 0)\nMũi 2: 3 ngày sau mũi 1 (ngày 3)\nMũi 3: 4 ngày sau mũi 2 (ngày 7)\nMũi 4: 7 ngày sau mũi 3 (ngày 14)",
      route:
        "Tiêm bắp (hoặc tiêm dưới da) - TE: Tiêm khu vực 2 bên phía trước ngoài của bắp đùi. - Người lớn: vùng cơ Delta hoặc tiêm dưới da",
      sourceRow: 6,
    },
    {
      id: "P7_11",
      vaccine: "Avaxim 160UI/ 1ml",
      disease: "2.Viêm Gan A",
      object: "Từ 16 tuổi trở lên",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 6 tháng sau mũi 1",
      route: "Tiêm bắp 0,5 ml cơ delta cánh tay",
      sourceRow: 7,
    },
    {
      id: "P8_12",
      vaccine: "Avaxim 80UI/ 0.5ml",
      disease: "3.Viêm Gan A",
      object: "Trên 12 tháng tuổi đến 16 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 6 tháng sau mũi 1",
      route: "Tiêm bắp 0,5ml cơ delta cánh tay",
      sourceRow: 8,
    },
    {
      id: "P9_13",
      vaccine: "Gardasil 4",
      disease: "Ung thư cổ tử cung",
      object: "Từ 9 tuổi đến 26 tuổi",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên \nMũi 2: 2 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 1",
      route:
        "Tiêm bắp 0,5ml cơ Dellta cánh tay/ vùng trước bên của phía trên đùi",
      sourceRow: 9,
    },
    {
      id: "P10_14",
      vaccine: "Gardasil 9",
      disease:
        "Ung thư cổ tử cung ((phòng UTCTC, âm hộ, âm đạo của tuýp 16 và 18; và các tổn thương tiền ung thư, loạn sản; mụn cóc sinh dục(sùi mào gà sinh dục của tuýp 6 và 11)… do HPV gây ra))",
      object: "Từ 9 đến 45 tuổi",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên \nMũi 2: 2 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 1\nNote: Nếu tiêm không đúng phát đồ trên có thể tiêm:\nMũi 1: Lần tiêm đầu tiên \nMũi 2: 2 tháng sau mũi 1\nMũi 3: 3 tháng sau mũi 2",
      route:
        "Tiêm bắp 0,5ml cơ Dellta cánh tay/ vùng trước bên của phía trên đùi",
      sourceRow: 10,
    },
    {
      id: "P11_15",
      vaccine: "GCFLU Quadrivalent",
      disease: "1.Cúm mùa",
      object:
        "Từ 6 tháng tuổi đến dưới 9 tuổi ( Chưa tiêm phòng cúm trước đó )",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm bắp",
      sourceRow: 11,
    },
    {
      id: "P12_16",
      vaccine: "GCFLU Quadrivalent",
      disease: "2.Cúm mùa",
      object: "Trên 9 tuổi - Người lớn",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 12 tháng sau mũi 1",
      route: "Tiêm bắp",
      sourceRow: 12,
    },
    {
      id: "P13_17",
      vaccine: "Influvac Tetra",
      disease: "1.Cúm mùa",
      object:
        "Từ 6 tháng tuổi đến dưới 9 tuổi ( Chưa tiêm phòng cúm trước đó )",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm bắp",
      sourceRow: 13,
    },
    {
      id: "P14_18",
      vaccine: "Influvac Tetra",
      disease: "2.Cúm mùa",
      object: "Trên 9 tuổi - Người lớn",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 12 tháng sau mũi 1",
      route: "Tiêm bắp",
      sourceRow: 14,
    },
    {
      id: "P15_19",
      vaccine: "Havax 0.5ml",
      disease: "1.Viêm Gan A",
      object: "Từ 2 tuổi đến 18 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 6 tháng sau mũi 1",
      route: "Tiêm bắp cơ delta",
      sourceRow: 15,
    },
    {
      id: "P16_20",
      vaccine: "Heberbiovac",
      disease: "Viêm gan B",
      object: "Trẻ từ 2 tuổi - Người lớn ( Chưa có kháng thể )",
      schedule:
        " Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 1\nMũi 4: 5 năm sau mũi 1 ( Có thể xét nghiệm kiểm tra kháng thể trước khi tiêm nhắc )",
      route:
        "Tiêm bắp sâu cơ delta Trẻ nhỏ tiêm ở mặt trước ngoài của đùi",
      sourceRow: 16,
    },
    {
      id: "P17_21",
      vaccine: "Gene - Hbvac",
      disease: "Viêm gan B",
      object: "Trẻ từ 2 tuổi - Người lớn ( Chưa có kháng thể )",
      schedule:
        " Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 1\nMũi 4: 5 năm sau mũi 1 ( Có thể xét nghiệm kiểm tra kháng thể trước khi tiêm nhắc )",
      route:
        "Tiêm bắp sâu cơ delta Trẻ nhỏ tiêm ở mặt trước ngoài của đùi",
      sourceRow: 17,
    },
    {
      id: "P18_22",
      vaccine: "Hexaxim",
      disease:
        "Bạch hầu, ho gà, uốn ván, bại liệt, Hib và VGB ( 6 trong 1 )",
      object:
        "Từ 2 tháng tuổi đến 2 tuổi ( Hoàn thành trước 24 tháng tuổi )",
      schedule:
        "Mũi 1: lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 1 tháng sau mũi 2\nMũi 4: 12 tháng sau mũi 3(cách tối thiểu 6 tháng).",
      route: "Tiêm bắp 0,5ml mặt trước ngoài đùi",
      sourceRow: 18,
    },
    {
      id: "P19_23",
      vaccine: "Infanrix Hexa",
      disease:
        "Bạch hầu, ho gà, uốn ván, bại liệt, Hib và VGB ( 6 trong 1 )",
      object:
        "Từ 2 tháng tuổi đến 2 tuổi ( Hoàn thành trước 18 tháng tuổi )",
      schedule:
        "Mũi 1: lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 1 tháng sau mũi 2\nMũi 4: 12 tháng sau mũi 3 (cách tối thiểu 6 tháng).",
      route: "Tiêm bắp 0,5ml mặt trước ngoài đùi",
      sourceRow: 19,
    },
    {
      id: "P20_24",
      vaccine: "Ivacflu - S",
      disease: "1.Cúm mùa",
      object: "Trên 6 tháng tuổi đến dưới 9 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm bắp 0,25ml ( nửa ống )",
      sourceRow: 20,
    },
    {
      id: "P21_25",
      vaccine: "Ivacflu - S",
      disease: "2.Cúm mùa",
      object: "Trên 9 tuổi - Người lớn",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 12 tháng sau mũi 1",
      route: "Tiêm bắp 0,5ml ( 1 ống )",
      sourceRow: 21,
    },
    {
      id: "P22_26",
      vaccine: "Jeev 3mcg/0.5ml",
      disease: "3.Viêm não Nhật Bản",
      object: "Trên 1 tuổi đến dưới 3 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm bắp vào vùng trước đùi",
      sourceRow: 22,
    },
    {
      id: "P23_27",
      vaccine: "Jeev 6mcg/0.5ml",
      disease: "4.Viêm não Nhật Bản",
      object: "Trên 3 tuổi đến dưới 49 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm bắp cơ delta cánh tay",
      sourceRow: 23,
    },
    {
      id: "P24_28",
      vaccine: "Jevax/0.5ml",
      disease: "1.Viêm não Nhật Bản",
      object: "Trên 12 tháng tuổi đến dưới 36 tháng tuổi",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 2 tuần sau mũi 1\nMũi 3: 1 năm sau mũi 1\nMũi 4: 3 năm sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 24,
    },
    {
      id: "P25_29",
      vaccine: "Jevax/1ml",
      disease: "2.Viêm não Nhật Bản",
      object: "Trên 36 tháng tuổi - Người lớn",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 2 tuần sau mũi 1\nMũi 3: 1 năm sau mũi 1\nMũi 4: 3 năm sau mũi 1",
      route: "Tiêm dưới da 1ml",
      sourceRow: 25,
    },
    {
      id: "P26_30",
      vaccine: "Menactra",
      disease:
        "1.Viêm màng não, nhiễm khuẩn huyết, viêm phổi do não mô cầu khuẩn nhóm A,C,Y,W-135",
      object: "Từ 9 tháng dưới 24 tháng tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 3 tháng sau mũi 1",
      route: "Tiêm bắp cơ delta Hoặc mặt trước ngoài của đùi",
      sourceRow: 26,
    },
    {
      id: "P27_31",
      vaccine: "Menactra",
      disease:
        "2.Viêm màng não, nhiễm khuẩn huyết, viêm phổi do não mô cầu khuẩn nhóm A,C,Y,W-135",
      object: "Từ 2 tuổi đến 55 tuổi",
      schedule: "1 liều duy nhất",
      route: "Tiêm bắp cơ delta",
      sourceRow: 27,
    },
    {
      id: "P28_32",
      vaccine: "Pemtaxim",
      disease:
        "Bạch hầu, ho gà, uốn ván, bại liệt và Hib ( 5 trong 1 ) ( Tiêm ở trạm Y Tế )",
      object: "2 tháng tuổi",
      schedule:
        "Mũi 1: lần tiêm đầu tiên.\nMũi 2: 1 tháng sau mũi 1.\nMũi 3: 1 tháng sau mũi 2.\nMũi 4: 12 tháng sau mũi 1 ( trên 1 tuổi )",
      route: "Tiêm bắp 0,5ml mặt trước ngoài đùi",
      sourceRow: 28,
    },
    {
      id: "P29_33",
      vaccine: "Qdenga",
      disease: "Sốt xuất huyết do virus Dengue gây ra",
      object: "Từ 4 tuổi trở lên",
      schedule:
        "Mũi 1: lần tiêm đầu tiên trong độ tuổi \nMũi 2: cách mũi đầu tiên 3 tháng.",
      route: "Tiêm dưới da, tốt nhất là ở cánh tay trên ở vùng cơ delta.",
      sourceRow: 29,
    },
    {
      id: "P30_34",
      vaccine: "Quimi - Hib",
      disease: "Viêm phổi và viêm màng não mũ do Hib",
      object: "2 tháng tuổi",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên ( từ 2 tháng tuổi )\nMũi 2: 18 tháng sau mũi 1\nNote: nếu ≥ 15 tháng tuổi mà chưa tiêm thì tiêm 1 mũi",
      route: "Tiêm bắp",
      sourceRow: 30,
    },
    {
      id: "P31_35",
      vaccine: "Rotarix",
      disease: "1.Tiêu chảy",
      object: "Từ 2 tháng đến 6 tháng tuổi",
      schedule:
        "Liều 1: 6 tuần tuổi\nLiều 2: 1 tháng sau liều 1 ( hoàn thành trước 6 tháng tuổi )",
      route: "Uống 1,5ml",
      sourceRow: 31,
    },
    {
      id: "P32_36",
      vaccine: "Rotateq",
      disease:
        "2.Tiêu chảy ( Phòng bệnh dạ dày - ruột do rotavirus type huyết thanh G1 và không phải G1( như G2,G3,G4, G9 )",
      object: "Từ 2 tháng đến 8 tháng tuổi",
      schedule:
        "Liều 1: 7,5 tuần tuổi\nLiều 2: 1 tháng sau liều 1\nLiều 3: 1 tháng sau liều 2 ( hoàn thành trước 8 tháng tuổi )",
      route: "Uống 2ml",
      sourceRow: 32,
    },
    {
      id: "P33_37",
      vaccine: "Rotavin",
      disease: "3.Tiêu chảy",
      object: "Từ 2 tháng đến 6 tháng tuổi",
      schedule:
        "Liều 1: 6 tuần tuổi\nLiều 2: 1 tháng sau liều 1 ( hoàn thành trước 6 tháng tuổi )",
      route: "Uống 2ml",
      sourceRow: 33,
    },
    {
      id: "P34_38",
      vaccine: "SAT",
      disease:
        "Huyết thanh kháng uốn ván ( Dự phòng bệnh uốn ván trong trường hợp bị các vết thương, vết cắn súc vật. Điều trị bệnh nhân bị bệnh uốn ván (khi đã có triệu chứng bệnh )",
      object:
        "Dự phòng cho trẻ em và người lớn: Vết thương có nguy cơ nhiễm nha bào vi trùng uốn ván Vết thương đã được tiêm phòng trước đó >10 năm Vết thương có chế độ tiêm phòng không đầy đủ/ Không chắc chắn",
      schedule:
        "Tiêm càng sớm càng tốt sau bị thương\nTăng gấp đôi với vết thương dễ gây uốn ván/ Chậm trễ sau bị thương/ Người có trọng lượng quá cao\nNote: Điều trị\nUốn ván sơ sinh: 5.000-10.000đvqt\nTrẻ em, người lớn: 50.000-100.000đvqt, tiêm dưới da nửa liều và tiêm bắp nửa liều còn lại",
      route:
        "Phương pháp Besredka: Tiêm 0,1ml, chờ 30 phút tiêm 0,25ml, chờ 30 phút nếu không phản ứng thì tiêm hết liều còn lại",
      sourceRow: 34,
    },
    {
      id: "P35_39",
      vaccine: "Synfloric",
      disease:
        "1.PHẾ CẦU 10 (phòng bệnh do phế cầu như viêm phổi, viêm màng não, viêm tai giữa, nhiễm khuẩn huyết )",
      object: "Từ 2 tháng đến 6 tháng tuổi",
      schedule:
        "Phác đồ 3+1\nMũi 1: lần tiêm đầu tiên (6 tuần tuổi đến 2 tháng tuổi)\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 1 tháng sau mũi 2\nMũi 4: 6 tháng sau mũi 3\nTrẻ sinh non (ít nhất 27 tuần tuổi thai) chủng ngừa khi được 2 tháng tuổi và sử dụng phát đồ 3+1 trên",
      route:
        "Trẻ nhỏ: Tiêm bắp mặt trước bên đùi Trẻ lớn: Tiêm bắp cơ Delta cánh tay",
      sourceRow: 35,
    },
    {
      id: "P36_40",
      vaccine: "Synfloric",
      disease:
        "2.PHẾ CẦU 10 (phòng bệnh do phế cầu như viêm phổi, viêm màng não, viêm tai giữa, nhiễm khuẩn huyết )",
      object: "7 tháng đến 11 tháng tuổi ( chưa được tiêm trước đó)",
      schedule:
        "Mũi 1: Tiêm lần đầu\nMũi 2: 1 tháng sau mũi 1\nMũi 3: 2 tháng sau mũi 2 ( Trên 1 tuổi )",
      route:
        "Trẻ nhỏ: Tiêm bắp 0,5ml mặt trước bên đùi Trẻ lớn: Tiêm bắp 0,5ml cơ Delta cánh tay",
      sourceRow: 36,
    },
    {
      id: "P37_41",
      vaccine: "Synfloric",
      disease:
        "3.PHẾ CẦU 10 (phòng bệnh do phế cầu như viêm phổi, viêm màng não, viêm tai giữa, nhiễm khuẩn huyết )",
      object: "Trên 12 tháng tuổi đến 5 tuổi ( chưa được tiêm trước đó)",
      schedule: "Mũi 1: Tiêm lần đầu \nMũi 2: 2 tháng sau mũi 1",
      route:
        "Trẻ nhỏ: Tiêm bắp 0,5ml mặt trước bên đùi Trẻ lớn: Tiêm bắp 0,5ml cơ Delta cánh tay",
      sourceRow: 37,
    },
    {
      id: "P38_42",
      vaccine:
        "Vacxin Measles, Mumps and Rubella live, Attenuated-M.M.R 0.5ML",
      disease: "1.Sởi , Quai bị , Rubella",
      object: "12 tháng đến 7 tuổi ( Nếu trước đó đã tiêm sởi đơn)",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 3 năm sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 35,
    },
    {
      id: "P39_43",
      vaccine:
        "Vacxin Measles, Mumps and Rubella live, Attenuated-M.M.R 0.5ML",
      disease: "2.Sởi , Quai bị , Rubella",
      object: "Trên 7 tuổi - Người lớn ( chưa tiêm chủng)",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nNote: Phụ nữ tiêm trước mang thai ít nhất 3 tháng",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 39,
    },
    {
      id: "P40_44",
      vaccine: "MMR II",
      disease: "1.Sởi , Quai bị , Rubella",
      object: "12 tháng đến 7 tuổi ( Nếu trước đó đã tiêm sởi đơn)",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 3 năm sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 40,
    },
    {
      id: "P41_45",
      vaccine: "MMR II",
      disease: "2.Sởi , Quai bị , Rubella",
      object: "Trên 7 tuổi - Người lớn ( chưa tiêm chủng)",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nNote: Phụ nữ tiêm trước mang thai ít nhất 3 tháng",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 41,
    },
    {
      id: "P42_46",
      vaccine: "VA-Mengoc-BC",
      disease: "Viêm màng não, não mô cầu",
      object: "Từ 6 tháng tuổi đến 45 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 2 tháng sau mũi 1",
      route:
        "Tiêm bắp sâu cơ delta cánh tay Trẻ nhỏ tiêm ở mặt trước ngoài của đùi",
      sourceRow: 42,
    },
    {
      id: "P43_47",
      vaccine: "Varivax",
      disease: "1.Thủy Đậu",
      object: "Trên 12 tháng - 12 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 3 tháng sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 43,
    },
    {
      id: "P44_48",
      vaccine: "Varivax",
      disease: "2.Thủy Đậu",
      object: "Trên 13 tuổi - Người lớn",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 44,
    },
    {
      id: "P45_49",
      vaccine: "Varicella",
      disease: "1.Thủy Đậu",
      object: "Trên 12 tháng - 12 tuổi",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 3 tháng sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 45,
    },
    {
      id: "P46_50",
      vaccine: "Varicella",
      disease: "2.Thủy Đậu",
      object: "Trên 13 tuổi - Người lớn",
      schedule: "Mũi 1: Lần tiêm đầu tiên\nMũi 2: 1 tháng sau mũi 1",
      route: "Tiêm dưới da 0,5ml",
      sourceRow: 46,
    },
    {
      id: "P47_51",
      vaccine: "VAT",
      disease: "1.Uốn ván hấp thụ",
      object:
        "Tiêm khi vết thương có nguy cơ uốn ván (có thể sử dụng huyết thanh cùng lúc nếu vết thương lớn, hoặc tiền sử tiêm ngừa không rõ ràng, không đầy đủ)",
      schedule:
        "Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 2\nMũi 4: 120 tháng sau mũi 1",
      route: "Tiêm bắp sâu 0,5ml hoặc dưới da",
      sourceRow: 47,
    },
    {
      id: "P48_52",
      vaccine: "VAT",
      disease: "2.Uốn ván hấp thụ",
      object:
        "Phụ nữ mang thai lần đầu ( Tiêm vào 3 tháng giữa thai kỳ )",
      schedule:
        "Mũi 1: Tiêm sớm khi phát hiện có thai\nMũi 2: 1 tháng sau mũi 1 ( Trước ngày dự sinh ít nhất 1 tháng )",
      route: "Tiêm bắp sâu 0,5ml",
      sourceRow: 48,
    },
    {
      id: "P49_53",
      vaccine: "VAT",
      disease: "3.Uốn ván hấp thụ",
      object:
        "Phụ nữ mang thai lần 2,3,4 ( Tiêm vào 3 tháng giữa thai kỳ )",
      schedule: "Tiêm 1 mũi ( Trước dự sinh ít nhất 1 tháng )",
      route: "Tiêm bắp sâu 0,5ml",
      sourceRow: 49,
    },
    {
      id: "P50_54",
      vaccine: "Prevenar 20",
      disease: "1.Phế cầu 20",
      object: "Trẻ từ 2 tháng tuổi - dưới 7 tháng tuổi",
      schedule:
        " Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nMũi 3: 1 tháng sau mũi 2\nMũi 4: 8 tháng sau mũi 3 (khi trẻ từ 1 tuổi, mũi 4 có thể cách mũi 3 tối thiểu 2 tháng",
      route: "Tiêm bắp sâu 0,5ml",
      sourceRow: 50,
    },
    {
      id: "P51_55",
      vaccine: "Prevenar 20",
      disease: "1.Phế cầu 20",
      object: "Trẻ từ tròn 7 tháng tuổi - dưới 12 tháng tuổi",
      schedule:
        " Mũi 1: Lần tiêm đầu tiên \nMũi 2: 1 tháng sau mũi 1\nMũi 3: 6 tháng sau mũi 2 ( khi trẻ từ 1 tuổi, mũi 3 có thể cách mũi 2 tối thiểu 2 tháng",
      route: "Tiêm bắp sâu 0,5ml",
      sourceRow: 51,
    },
    {
      id: "P52_56",
      vaccine: "Prevenar 20",
      disease: "1.Phế cầu 20",
      object: "Trẻ từ tròn 12 tháng tuổi - dưới 24 tháng tuổi",
      schedule: " Mũi 1: Lần tiêm đầu tiên \nMũi 2: 2 tháng sau mũi 1",
      route: "Tiêm bắp sâu 0, 5ml",
      sourceRow: 52,
    },
    {
      id: "P53_57",
      vaccine: "Prevenar 20",
      disease: "1.Phế cầu 20",
      object: "Trẻ từ tròn 24 tháng tuổi trở lên",
      schedule: "1 mũi duy nhất",
      route: "Tiêm bắp sâu 0,5ml",
      sourceRow: 53,
    },
  ],
  vaccines: [
    "Bạch hầu, ho gà, uốn ván, bại liệt và Hib - Pemtaxim",
    "Bạch hầu, ho gà, uốn ván, bại liệt, Hib và VGB - Hexaxim",
    "Bạch hầu, ho gà, uốn ván, bại liệt, Hib và VGB - Infanrix Hexa",
    "Cúm mùa - GCFLU Quadrivalent",
    "Cúm mùa - Influvac Tetra",
    "Cúm mùa - Ivacflu - S",
    "Dại - Abhayrab",
    "Dại - Indirad",
    "Huyết thanh kháng uốn ván - SAT",
    "PHẾ CẦU 10 - Synfloric",
    "PHẾ CẦU 13 - Prevenar 13",
    "Phế cầu 20 - Prevenar 20",
    "Sốt xuất huyết do virus Dengue gây ra - Qdenga",
    "Sởi , Quai bị , Rubella - MMR II",
    "Sởi , Quai bị , Rubella - Vacxin Measles, Mumps and Rubella live, Attenuated-M.M.R 0.5ML",
    "Thủy Đậu - Varicella",
    "Thủy Đậu - Varivax",
    "Tiêu chảy - Rotarix",
    "Tiêu chảy - Rotateq",
    "Tiêu chảy - Rotavin",
    "Ung thư cổ tử cung - Gardasil 4",
    "Ung thư cổ tử cung - Gardasil 9",
    "Uốn ván hấp thụ - VAT",
    "Viêm Gan A - Avaxim 160UI/ 1ml",
    "Viêm Gan A - Avaxim 80UI/ 0.5ml",
    "Viêm Gan A - Havax 0.5ml",
    "Viêm gan B - Gene - Hbvac",
    "Viêm gan B - Heberbiovac",
    "Viêm màng não, nhiễm khuẩn huyết, viêm phổi do não mô cầu khuẩn nhóm A,C,Y,W-135 - Menactra",
    "Viêm màng não, não mô cầu - VA-Mengoc-BC",
    "Viêm não Nhật Bản - Jeev 3mcg/0.5ml",
    "Viêm não Nhật Bản - Jeev 6mcg/0.5ml",
    "Viêm não Nhật Bản - Jevax/0.5ml",
    "Viêm não Nhật Bản - Jevax/1ml",
    "Viêm phổi và viêm màng não mũ do Hib - Quimi - Hib"
  ],
};


export const DOSE_LABELS = ["Mũi 1", "Mũi 2", "Mũi 3", "Mũi 4", "Mũi 5", "Mũi nhắc"];

export function norm(s: string): string {
  return (s || "")
    .toString()
    .replace(/[đĐ]/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchSearch(target: string, query: string): boolean {
  const qClean = norm(query);
  if (!qClean) return true;
  const tClean = norm(target);
  const words = qClean.split(/\s+/);
  return words.every(word => tClean.includes(word));
}


export function parseDate(v: string): Date | null {
  v = (v || "").trim();
  if (!v) return null;
  const m = v.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) {
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return isValidDate(d) ? d : null;
  }
  // Try ISO date
  const mIso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (mIso) {
    const d = new Date(+mIso[1], +mIso[2] - 1, +mIso[3]);
    return isValidDate(d) ? d : null;
  }
  return null;
}

export function isValidDate(d: Date): boolean {
  return d instanceof Date && !isNaN(d.getTime()) && d.getFullYear() > 1900;
}

export function fmtDate(d: Date | null): string {
  if (!d || !isValidDate(d)) return "";
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}

export function fmtDateIso(d: Date | null): string {
  if (!d || !isValidDate(d)) return "";
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export function maskDateText(v: string, isDeleting: boolean = false): string {
  const digits = (v || "").replace(/\D/g, "").slice(0, 8);
  let out = "";
  if (digits.length < 2) {
    out = digits;
  } else if (digits.length === 2) {
    out = digits + (isDeleting ? "" : "/");
  } else if (digits.length < 4) {
    out = digits.slice(0, 2) + "/" + digits.slice(2);
  } else if (digits.length === 4) {
    out = digits.slice(0, 2) + "/" + digits.slice(2, 4) + (isDeleting ? "" : "/");
  } else {
    out =
      digits.slice(0, 2) +
      "/" +
      digits.slice(2, 4) +
      "/" +
      digits.slice(4);
  }
  return out;
}

export function addInterval(d: Date, it: any): Date | null {
  const x = new Date(d);
  if (!it) return null;
  if (it.unit === "day") x.setDate(x.getDate() + it.value);
  if (it.unit === "week") x.setDate(x.getDate() + it.value * 7);
  if (it.unit === "month") x.setMonth(x.getMonth() + it.value);
  if (it.unit === "year") x.setFullYear(x.getFullYear() + it.value);
  return x;
}

export function monthsAge(dob: Date, at: Date): number {
  return (
    (at.getFullYear() - dob.getFullYear()) * 12 +
    (at.getMonth() - dob.getMonth()) -
    (at.getDate() < dob.getDate() ? 1 : 0)
  );
}

export function parseAgeRange(text: string): { min: number | null; max: number | null } {
  const t = norm(text);
  let min: number | null = null;
  let max: number | null = null;

  function setMin(v: number, u: string) {
    const m = (u.startsWith("nam") || u.startsWith("tuoi"))
      ? v * 12
      : u.startsWith("tuan")
        ? v / 4.345
        : v;
    if (min === null || m < min) min = m;
  }

  function setMax(v: number, u: string) {
    const m = (u.startsWith("nam") || u.startsWith("tuoi"))
      ? v * 12
      : u.startsWith("tuan")
        ? v / 4.345
        : v;
    if (max === null || m > max) max = m;
  }
  
  const mRange = t.match(/(?:tu|tren|duoc)\s*(\d+(?:[.,]\d+)?)\s*(?:den|toi|-)\s*(?:duoi\s*)?(\d+(?:[.,]\d+)?)\s*(tuan|thang|nam|tuoi)/);
  if (mRange) {
    setMin(parseFloat(mRange[1].replace(",", ".")), mRange[3]);
    setMax(parseFloat(mRange[2].replace(",", ".")), mRange[3]);
  }
  
  for (const m of t.matchAll(
    /(?:tu|tren|duoc|sau|>=)\s*(\d+(?:[.,]\d+)?)\s*(tuan|thang|nam|tuoi)/g
  )) {
    setMin(parseFloat(m[1].replace(",", ".")), m[2]);
  }

  for (const m of t.matchAll(
    /(?:duoi|<|den duoi|toi duoi|den|toi|-)\s*(\d+(?:[.,]\d+)?)\s*(tuan|thang|nam|tuoi)/g
  )) {
    setMax(parseFloat(m[1].replace(",", ".")), m[2]);
  }

  if (t.includes("nguoi lon")) min = min ?? 192;
  return { min, max };
}

export function parseSchedule(s: string) {
  const raw = s || "";
  const t = norm(raw).replace(/lieu/g, "mui");
  const intervals: any[] = Array(6).fill(null);
  const labels = [...DOSE_LABELS];
  const notes = Array(6).fill("");

  const dash =
    raw.match(/ngày\s*0\s*[-–,]\s*3\s*[-–,]\s*7\s*[-–,]\s*14\s*[-–,]\s*28/i) ||
    t.match(/ngay\s*0\s*[-–,]\s*3\s*[-–,]\s*7\s*[-–,]\s*14\s*[-–,]\s*28/i);
  
  if (dash) {
    [0, 3, 7, 14, 28].forEach(
      (v, i) =>
        (intervals[i] = {
          from: 0,
          value: v,
          unit: "day",
          desc: "Ngày " + v + " sau mũi 1",
        })
    );
    return { labels, intervals, notes };
  }

  const monthSeq = t.match(/(?:0|o)\s*[,\-]\s*(\d+)\s*[,\-]\s*(\d+)\s*thang/);
  if (monthSeq) {
    intervals[0] = { from: 0, value: 0, unit: "day", desc: "Mũi đầu" };
    intervals[1] = {
      from: 0,
      value: +monthSeq[1],
      unit: "month",
      desc: monthSeq[1] + " tháng sau mũi 1",
    };
    intervals[2] = {
      from: 0,
      value: +monthSeq[2],
      unit: "month",
      desc: monthSeq[2] + " tháng sau mũi 1",
    };
  }

  raw.split(/\n|;/).forEach((line) => {
    const l = norm(line).replace(/lieu/g, "mui");
    let idx: number | null = null;
    const mm = l.match(/mui\s*(\d+)/);
    if (mm) idx = +mm[1] - 1;
    else if (l.includes("mui nhac")) idx = 5;
    if (idx === null || idx < 0 || idx > 5) return;
    notes[idx] = line.trim();
    if (idx === 0)
      intervals[idx] = intervals[idx] || {
        from: 0,
        value: 0,
        unit: "day",
        desc: "Mũi đầu",
      };

    const r = l.match(/(\d+)\s*(ngay|tuan|thang|nam|tuoi)\s*sau\s*mui\s*(\d+)/);
    if (r) {
      intervals[idx] = {
        from: +r[3] - 1,
        value: +r[1],
        unit:
          r[2] === "ngay"
            ? "day"
            : r[2] === "tuan"
              ? "week"
              : (r[2] === "nam" || r[2] === "tuoi")
                ? "year"
                : "month",
        desc: r[1] + " " + r[2] + " sau mũi " + r[3],
      };
    }

    const r2 = l.match(/cach\s*mui\s*(\d+)\s*(\d+)\s*(ngay|tuan|thang|nam|tuoi)/);
    if (r2) {
      intervals[idx] = {
        from: +r2[1] - 1,
        value: +r2[2],
        unit:
          r2[3] === "ngay"
            ? "day"
            : r2[3] === "tuan"
              ? "week"
              : (r2[3] === "nam" || r2[3] === "tuoi")
                ? "year"
                : "month",
        desc: r2[2] + " " + r2[3] + " sau mũi " + r2[1],
      };
    }
  });

  if (
    t.includes("1 thang sau mui 1") &&
    !intervals[2] &&
    t.includes("1 thang sau mui 2")
  ) {
    intervals[2] = {
      from: 1,
      value: 1,
      unit: "month",
      desc: "1 tháng sau mũi 2",
    };
  }

  return { labels, intervals, notes };
}

export function sequentialInterval(plan: any, i: number) {
  const it = plan.intervals[i];
  if (!it) return null;
  if (it.from === i - 1) {
    return {
      ...it,
      desc: it.desc || `${it.value} ${intervalUnitText(it.unit)} sau mũi ${i}`,
    };
  }
  const prev = plan.intervals[i - 1];
  if (
    prev &&
    prev.from === it.from &&
    prev.unit === it.unit &&
    typeof prev.value === "number" &&
    typeof it.value === "number" &&
    it.value >= prev.value
  ) {
    const v = it.value - prev.value;
    return {
      from: i - 1,
      value: v,
      unit: it.unit,
      desc: `${v} ${intervalUnitText(it.unit)} sau mũi ${i}`,
    };
  }
  return it;
}

function intervalUnitText(u: string): string {
  return u === "day"
    ? "ngày"
    : u === "week"
      ? "tuần"
      : u === "year"
        ? "năm"
        : "tháng";
}

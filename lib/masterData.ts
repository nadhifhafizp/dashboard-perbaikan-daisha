export interface DaishaMasterInfo {
  seksi: string;
  jenisKerusakan: Record<string, string[]>;
}

export const masterDataDaisha: Record<string, DaishaMasterInfo> = {
  "Battery car": {
    "seksi": "All seksi",
    "jenisKerusakan": {
      "Body cover": [
        "Body cover patah/ penyok/lepas"
      ],
      "Gandengan": [
        "Gandengan lepas",
        "Kait gandengan aus",
        "Shaft gandengan aus"
      ],
      "Others": [
        "Others"
      ] 
    }
  },
  "Bead Preset": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Hanger": [
        "Hanger patah",
        "Lock patah",
        "Pin lock lepas / patah",
        "Rantai lock lepas"
      ],
      "Others": [
        "Others"
      ],
      "Plat No": [
        "Plat no rusak / patah / hilang"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Covering": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Hanger": [
        "Hanger patah/bengkok"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Layer": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Brake Unit": [
        "Baud pengikat disc brake hilang/lepas/kendor",
        "Disc brake rusak / hilang"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Shaft roll": [
        "Shaft roll bengkok"
      ],
      "Stopper disck brake": [
        "Las-lasan patah"
      ]
    }
  },
  "Monowire": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Hanger": [
        "Hanger patah/bengkok"
      ],
      "Others": [
        "Others"
      ],
      "Plat No": [
        "Plat no rusak / patah / hilang"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Ohaba Chaffer": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Braket Shaft roll": [
        "Baud pengikat braket lepas/kendor/lasan patah",
        "Bearing rusak",
        "Lubang shaft aus"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Others": [
        "Others"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roll atas": [
        "Shaft roll atas aus"
      ],
      "Roll bawah": [
        "Shaft roll bawah aus"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Ohaba layer": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Brake Unit": [
        "Disc brake rusak / hilang",
        "Kanvas brake aus"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Drum roll": [
        "Bearing drum roll macet/seret",
        "Shaft drum roll patah"
      ],
      "Others": [
        "Others"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Plat cover material": [
        "Plat patah/penyok"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "RTB": {
    "seksi": "Bead",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Hanger": [
        "Hanger patah/bengkok"
      ],
      "Others": [
        "Others"
      ],
      "Plat No": [
        "Plat no rusak / patah / hilang"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Support TL": [
        "Support TL patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "GT Ring": {
    "seksi": "Building",
    "jenisKerusakan": {
      "Barcode case": [
        "Barcode case patah / lepas / hilang"
      ],
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Plat No": [
        "Dudukan plat no patah",
        "Plat no hilang"
      ],
      "Ring": [
        "Ring patah"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Shaft": [
        "Shaft patah"
      ],
      "Stopper dudukan ring": [
        "Stopper kendor"
      ],
      "Tag case": [
        "Tage case patah / lepas / hilang"
      ]
    }
  },
  "KB drum / Jikogu": {
    "seksi": "Building",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  },
  "Transfer reel belt": {
    "seksi": "Building",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  },
  "Transfer reproses": {
    "seksi": "Building",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  },
  "Vertical": {
    "seksi": "Building",
    "jenisKerusakan": {
      "Bearing centering": [
        "Baud pengikat rusak (hilang, Patah)",
        "Bearing rusak / hilang",
        "Shaft dudukan bearing baring patah / penyok"
      ],
      "Body daisha": [
        "Baud pengikat body kendor / hilang",
        "Handle bengkok",
        "Stopper daisha patah",
        "Tiang body miring"
      ],
      "Gandengan belakang": [
        "Baud & Mur pengikat baud shaft kait hilang",
        "Baud & Mur pengikat bearing roller follower hilang",
        "Bearing roller follower rusak / hilang",
        "Gandengan / kait aus",
        "Braket lepas/patah"
      ],
      "Gandengan depan": [
        "Braket / dudukan lepas",
        "Gandengan aus"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus"
      ],
      "Spring tray": [
        "Baud & Mur adjuster spring hilang",
        "Shaft spring bengkok",
        "Spring tray rusak / lemah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ],
      "Tray": [
        "Baud pengikat tray hilang",
        "Braket dudukan tray patah / bengkok",
        "Dudukan tray patah / bengkok",
        "Stopper tray rusak",
        "Tray patah"
      ]
    }
  },
  "Can Auto Pigmen": {
    "seksi": "Bunbury",
    "jenisKerusakan": {
      "Can": [
        "Can penyok"
      ],
      "Tutup can": [
        "Tutup can penyok"
      ]
    }
  },
  "Can Chemical Omny": {
    "seksi": "Bunbury",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Can": [
        "Can penyok"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ],
      "Tutup can": [
        "Tutup can penyok"
      ]
    }
  },
  "Daisha auto pigmen": {
    "seksi": "Bunbury",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Pipa pembatas can": [
        "Pipa penyok/patah"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roll": [
        "Roll macet/seret"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Palet B/B": {
    "seksi": "Bunbury",
    "jenisKerusakan": {
      "Pipa": [
        "Pipa patah",
        "Pipa penyok/aus"
      ],
      "Plate": [
        "Plate aus",
        "Plate mencuat / las-lasan lepas"
      ]
    }
  },
  "Inner Liner": {
    "seksi": "Cutt/Cal",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Brake Unit": [
        "Baud pengikat disc brake hilang/lepas/kendor",
        "Disc brake rusak / hilang"
      ],
      "Braket Bearing brake": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Lubang shaft discbrake aus",
        "Roller aus",
        "Shaft dudukan bearing / disc brake aus"
      ],
      "Braket Bearing drum": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Guide roller aus",
        "Shaft dudukan bearing aus"
      ],
      "Braket Bearing roll": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Shaft dudukan bearing aus"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Drum": [
        "Drum aus",
        "Drum penyok"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case patah / lepas / hilang"
      ]
    }
  },
  "Omakitan (A-truck)": {
    "seksi": "Cutt/Cal",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan patah"
      ],
      "Brake Unit": [
        "Disc brake rusak / hilang",
        "Kanvas brake aus"
      ],
      "Kopling atas": [
        "Buad pengikat patah / aus / hilang",
        "Lubang shaft aus",
        "Sepatu kopling aus",
        "Spie aus"
      ],
      "Kopling bawah": [
        "Buad pengikat patah / aus / hilang",
        "Lubang shaft aus",
        "Sepatu kopling aus",
        "Spie aus"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Roll atas": [
        "Shaft dudukan kopling aus",
        "Shaft patah"
      ],
      "Roll bawah": [
        "Shaft dudukan kopling aus",
        "Shaft patah"
      ],
      "Roll spiral atas": [
        "Kawat spiral lepas",
        "Shaft pilow blok aus"
      ],
      "Roll spiral bawah": [
        "Kawat spiral lepas",
        "Shaft pilow blok aus"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Omakitan (B-truck)": {
    "seksi": "Cutt/Cal",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan patah"
      ],
      "Brake Unit": [
        "Disc brake rusak / hilang",
        "Kanvas brake aus"
      ],
      "Braket Shaft roll": [
        "Baud pengikat braket lepas/kendor/lasan patah",
        "Bearing rusak",
        "Lubang shaft aus"
      ],
      "Kopling atas": [
        "Buad pengikat patah / aus / hilang",
        "Lubang shaft aus",
        "Sepatu kopling aus",
        "Spie aus"
      ],
      "Kopling bawah": [
        "Buad pengikat patah / aus / hilang",
        "Lubang shaft aus",
        "Sepatu kopling aus",
        "Spie aus"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Roll atas": [
        "Shaft dudukan kopling aus",
        "Shaft patah"
      ],
      "Roll bawah": [
        "Shaft dudukan kopling aus",
        "Shaft patah"
      ],
      "Roll spiral atas": [
        "Kawat spiral lepas",
        "Shaft pilow blok aus"
      ],
      "Roll spiral bawah": [
        "Kawat spiral lepas",
        "Shaft pilow blok aus"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Ply": {
    "seksi": "Cutt/Cal",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Brake Unit": [
        "Baud pengikat disc brake hilang/lepas/kendor",
        "Disc brake rusak / hilang"
      ],
      "Braket Bearing brake": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Lubang shaft discbrake aus",
        "Roller aus",
        "Shaft dudukan bearing / disc brake aus"
      ],
      "Braket Bearing drum": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Guide roller aus",
        "Shaft dudukan bearing aus"
      ],
      "Braket Bearing roll": [
        "Baud pengikat braket rusak/lepas/hilang",
        "Bearing rusak / hilang / seret",
        "Shaft dudukan bearing aus"
      ],
      "Dorongan": [
        "Dorongan patah"
      ],
      "Drum": [
        "Drum aus",
        "Drum penyok"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Tag case": [
        "Tage case patah / lepas / hilang"
      ]
    }
  },
  "Reel Belt": {
    "seksi": "Cutt/Cal",
    "jenisKerusakan": {
      "Lubang Shaft box roll": [
        "Lubang shaft aus"
      ],
      "Pipa reel": [
        "Pipa patah",
        "Pipa penyok"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Box roll side": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Pipa box roll": [
        "Las-lasan patah",
        "Pipa penyok/seret"
      ],
      "Plat samping": [
        "Lock aus",
        "Plat penyok/patah"
      ]
    }
  },
  "Box roll top": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Pipa box roll": [
        "Las-lasan patah",
        "Pipa penyok/seret"
      ],
      "Plat samping": [
        "Lock aus",
        "Plat penyok/patah"
      ]
    }
  },
  "Daisha Comp' Kiriage": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Hanger": [
        "Hanger bengkok"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  },
  "Nagara Filler": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Body frame": [
        "Las-lasan body ada yg retak / patah"
      ],
      "Brake Unit": [
        "Bandul brake hilang / lepas",
        "Disc brake rusak / hilang",
        "Spring bandul lepas / hilang"
      ],
      "Gandengan belakang": [
        "Kait gandengan aus"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Lock shaft": [
        "Lock shaft Aus",
        "Lock shaft Hilang/ rusak"
      ],
      "Others": [
        "Others"
      ],
      "Pilow Block": [
        "Baud pengikat lepas / kendor / hilang",
        "Pilow block pecah"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roll atas": [
        "Shaft roll atas aus"
      ],
      "Roll bawah": [
        "Shaft roll bawah aus"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Reel Filler": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Drum reel": [
        "Drum aus",
        "Lubang lock aus"
      ],
      "Pipa reel": [
        "Pipa patah",
        "Pipa penyok"
      ],
      "Plat body": [
        "Las-lasan lepas/patah",
        "Plat penyok"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Reel Side": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Drum reel": [
        "Drum aus",
        "Lubang lock aus"
      ],
      "Pipa reel": [
        "Pipa patah",
        "Pipa penyok"
      ],
      "Plat body": [
        "Las-lasan lepas/patah",
        "Plat penyok"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Reel Top": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Drum reel": [
        "Drum aus",
        "Lubang lock aus"
      ],
      "Pipa reel": [
        "Pipa patah",
        "Pipa penyok"
      ],
      "Plat body": [
        "Las-lasan lepas/patah",
        "Plat penyok"
      ],
      "Tag case": [
        "Tage case lepas / hilang"
      ]
    }
  },
  "Transfer box roll": {
    "seksi": "Extruding",
    "jenisKerusakan": {
      "Body daisha": [
        "Las-lasan patah"
      ],
      "Gandengan depan": [
        "Ring gandengan aus",
        "Support gandengan lepas / patah"
      ],
      "Others": [
        "Others"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  },
  "Daisha chip polyfilm": {
    "seksi": "Polyfilm",
    "jenisKerusakan": {
      "Cover box": [
        "Engsel rusak",
        "Mes/saringan rusak"
      ],
      "Roda Putar": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ],
      "Roda tetap": [
        "Baud pengikat lepas / rusak",
        "Dudukan / braket roda penyok",
        "Roda aus",
        "Shaft as roda patah"
      ]
    }
  }
};

export const DAFTAR_SEKSI = [
  "All seksi",
  "Bead",
  "Building",
  "Bunbury",
  "Cutt/Cal",
  "Extruding",
  "Polyfilm"
];

export const DAFTAR_SEMUA_DAISHA = Object.keys(masterDataDaisha).sort();

export const DAFTAR_SEMUA_KOMPONEN = Array.from(
  new Set(
    Object.values(masterDataDaisha).flatMap(d => Object.keys(d.jenisKerusakan))
  )
).sort();

export function getDaishaBySeksi(seksi?: string): string[] {
  if (!seksi || seksi.toLowerCase() === 'all seksi') return DAFTAR_SEMUA_DAISHA;
  return Object.entries(masterDataDaisha)
    .filter(
      ([, data]) =>
        data.seksi.toLowerCase() === seksi.toLowerCase() ||
        data.seksi.toLowerCase() === 'all seksi'
    )
    .map(([nama]) => nama)
    .sort();
}

export function getKomponenKerusakan(namaDaisha?: string): string[] {
  if (namaDaisha && masterDataDaisha[namaDaisha]) {
    return Object.keys(masterDataDaisha[namaDaisha].jenisKerusakan);
  }
  return DAFTAR_SEMUA_KOMPONEN;
}

export function getDetailKerusakan(namaDaisha?: string, komponen?: string): string[] {
  if (!namaDaisha || !komponen || !masterDataDaisha[namaDaisha]) return [];
  return masterDataDaisha[namaDaisha].jenisKerusakan[komponen] || [];
}

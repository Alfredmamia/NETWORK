import { CameroonRegion } from '../types/network';

export const cameroonRegions: CameroonRegion[] = [
  {
    name: 'Adamaoua',
    nameFr: 'Adamaoua',
    nameEn: 'Adamawa',
    code: 'AD',
    coordinates: { lat: 6.5000, lng: 12.5000 },
    bounds: { north: 8.5, south: 5.5, east: 15.2, west: 11.0 },
    departments: [
      {
        name: 'Djérem',
        nameFr: 'Djérem',
        nameEn: 'Djerem',
        code: 'DJ',
        region: 'Adamaoua',
        coordinates: { lat: 6.1667, lng: 13.6667 },
        communes: [
          { name: 'Tibati', nameFr: 'Tibati', nameEn: 'Tibati', code: 'TIB', department: 'Djérem', coordinates: { lat: 6.4667, lng: 12.6333 } },
          { name: 'Meiganga', nameFr: 'Meiganga', nameEn: 'Meiganga', code: 'MEI', department: 'Djérem', coordinates: { lat: 6.5167, lng: 14.2833 } }
        ]
      },
      {
        name: 'Faro-et-Déo',
        nameFr: 'Faro-et-Déo',
        nameEn: 'Faro-and-Deo',
        code: 'FD',
        region: 'Adamaoua',
        coordinates: { lat: 8.3333, lng: 12.3667 },
        communes: [
          { name: 'Tignère', nameFr: 'Tignère', nameEn: 'Tignere', code: 'TIG', department: 'Faro-et-Déo', coordinates: { lat: 7.3667, lng: 12.6500 } },
          { name: 'Galim', nameFr: 'Galim', nameEn: 'Galim', code: 'GAL', department: 'Faro-et-Déo', coordinates: { lat: 7.4000, lng: 12.1167 } }
        ]
      },
      {
        name: 'Mayo-Banyo',
        nameFr: 'Mayo-Banyo',
        nameEn: 'Mayo-Banyo',
        code: 'MB',
        region: 'Adamaoua',
        coordinates: { lat: 6.7500, lng: 11.8167 },
        communes: [
          { name: 'Banyo', nameFr: 'Banyo', nameEn: 'Banyo', code: 'BAN', department: 'Mayo-Banyo', coordinates: { lat: 6.7500, lng: 11.8167 } },
          { name: 'Alme', nameFr: 'Alme', nameEn: 'Alme', code: 'ALM', department: 'Mayo-Banyo', coordinates: { lat: 6.9167, lng: 11.3333 } }
        ]
      },
      {
        name: 'Mbéré',
        nameFr: 'Mbéré',
        nameEn: 'Mbere',
        code: 'MBE',
        region: 'Adamaoua',
        coordinates: { lat: 6.1667, lng: 14.1667 },
        communes: [
          { name: 'Ngaoundal', nameFr: 'Ngaoundal', nameEn: 'Ngaoundal', code: 'NGA', department: 'Mbéré', coordinates: { lat: 6.5000, lng: 13.2667 } },
          { name: 'Dir', nameFr: 'Dir', nameEn: 'Dir', code: 'DIR', department: 'Mbéré', coordinates: { lat: 6.1667, lng: 14.1667 } }
        ]
      },
      {
        name: 'Vina',
        nameFr: 'Vina',
        nameEn: 'Vina',
        code: 'VIN',
        region: 'Adamaoua',
        coordinates: { lat: 7.3333, lng: 13.6667 },
        communes: [
          { name: 'Ngaoundéré 1er', nameFr: 'Ngaoundéré 1er', nameEn: 'Ngaoundere 1st', code: 'NGD1', department: 'Vina', coordinates: { lat: 7.3167, lng: 13.5833 } },
          { name: 'Ngaoundéré 2ème', nameFr: 'Ngaoundéré 2ème', nameEn: 'Ngaoundere 2nd', code: 'NGD2', department: 'Vina', coordinates: { lat: 7.3333, lng: 13.5667 } },
          { name: 'Ngaoundéré 3ème', nameFr: 'Ngaoundéré 3ème', nameEn: 'Ngaoundere 3rd', code: 'NGD3', department: 'Vina', coordinates: { lat: 7.3500, lng: 13.6000 } }
        ]
      }
    ]
  },
  {
    name: 'Centre',
    nameFr: 'Centre',
    nameEn: 'Centre',
    code: 'CE',
    coordinates: { lat: 3.8480, lng: 11.5021 },
    bounds: { north: 6.5, south: 2.2, east: 13.2, west: 10.5 },
    departments: [
      {
        name: 'Mfoundi',
        nameFr: 'Mfoundi',
        nameEn: 'Mfoundi',
        code: 'MF',
        region: 'Centre',
        coordinates: { lat: 3.8480, lng: 11.5021 },
        communes: [
          { name: 'Yaoundé 1er', nameFr: 'Yaoundé 1er', nameEn: 'Yaoundé 1st', code: 'YDE1', department: 'Mfoundi', coordinates: { lat: 3.8480, lng: 11.5021 } },
          { name: 'Yaoundé 2ème', nameFr: 'Yaoundé 2ème', nameEn: 'Yaoundé 2nd', code: 'YDE2', department: 'Mfoundi', coordinates: { lat: 3.8580, lng: 11.4921 } },
          { name: 'Yaoundé 3ème', nameFr: 'Yaoundé 3ème', nameEn: 'Yaoundé 3rd', code: 'YDE3', department: 'Mfoundi', coordinates: { lat: 3.8380, lng: 11.5121 } },
          { name: 'Yaoundé 4ème', nameFr: 'Yaoundé 4ème', nameEn: 'Yaoundé 4th', code: 'YDE4', department: 'Mfoundi', coordinates: { lat: 3.8280, lng: 11.5221 } },
          { name: 'Yaoundé 5ème', nameFr: 'Yaoundé 5ème', nameEn: 'Yaoundé 5th', code: 'YDE5', department: 'Mfoundi', coordinates: { lat: 3.8680, lng: 11.4821 } },
          { name: 'Yaoundé 6ème', nameFr: 'Yaoundé 6ème', nameEn: 'Yaoundé 6th', code: 'YDE6', department: 'Mfoundi', coordinates: { lat: 3.8180, lng: 11.5321 } },
          { name: 'Yaoundé 7ème', nameFr: 'Yaoundé 7ème', nameEn: 'Yaoundé 7th', code: 'YDE7', department: 'Mfoundi', coordinates: { lat: 3.8780, lng: 11.4721 } }
        ]
      },
      {
        name: 'Lekié',
        nameFr: 'Lekié',
        nameEn: 'Lekie',
        code: 'LEK',
        region: 'Centre',
        coordinates: { lat: 4.1000, lng: 11.3500 },
        communes: [
          { name: 'Monatélé', nameFr: 'Monatélé', nameEn: 'Monatele', code: 'MON', department: 'Lekié', coordinates: { lat: 4.1000, lng: 11.3500 } },
          { name: 'Obala', nameFr: 'Obala', nameEn: 'Obala', code: 'OBA', department: 'Lekié', coordinates: { lat: 4.1667, lng: 11.5333 } }
        ]
      },
      {
        name: 'Mbam-et-Inoubou',
        nameFr: 'Mbam-et-Inoubou',
        nameEn: 'Mbam-and-Inoubou',
        code: 'MBI',
        region: 'Centre',
        coordinates: { lat: 4.6000, lng: 11.1500 },
        communes: [
          { name: 'Bafia', nameFr: 'Bafia', nameEn: 'Bafia', code: 'BAF', department: 'Mbam-et-Inoubou', coordinates: { lat: 4.7500, lng: 11.2333 } },
          { name: 'Bokito', nameFr: 'Bokito', nameEn: 'Bokito', code: 'BOK', department: 'Mbam-et-Inoubou', coordinates: { lat: 4.5833, lng: 11.1667 } }
        ]
      }
    ]
  },
  {
    name: 'Est',
    nameFr: 'Est',
    nameEn: 'East',
    code: 'ES',
    coordinates: { lat: 4.5000, lng: 14.0000 },
    bounds: { north: 7.5, south: 1.0, east: 16.2, west: 11.5 },
    departments: [
      {
        name: 'Boumba-et-Ngoko',
        nameFr: 'Boumba-et-Ngoko',
        nameEn: 'Boumba-and-Ngoko',
        code: 'BN',
        region: 'Est',
        coordinates: { lat: 2.8333, lng: 15.8333 },
        communes: [
          { name: 'Yokadouma', nameFr: 'Yokadouma', nameEn: 'Yokadouma', code: 'YOK', department: 'Boumba-et-Ngoko', coordinates: { lat: 3.5167, lng: 15.0500 } },
          { name: 'Moloundou', nameFr: 'Moloundou', nameEn: 'Moloundou', code: 'MOL', department: 'Boumba-et-Ngoko', coordinates: { lat: 2.0333, lng: 15.1833 } }
        ]
      },
      {
        name: 'Haut-Nyong',
        nameFr: 'Haut-Nyong',
        nameEn: 'Upper-Nyong',
        code: 'HN',
        region: 'Est',
        coordinates: { lat: 4.0000, lng: 13.7500 },
        communes: [
          { name: 'Abong-Mbang', nameFr: 'Abong-Mbang', nameEn: 'Abong-Mbang', code: 'ABM', department: 'Haut-Nyong', coordinates: { lat: 3.9833, lng: 13.1833 } },
          { name: 'Doumé', nameFr: 'Doumé', nameEn: 'Doume', code: 'DOU', department: 'Haut-Nyong', coordinates: { lat: 4.2167, lng: 13.4167 } }
        ]
      }
    ]
  },
  {
    name: 'Extrême-Nord',
    nameFr: 'Extrême-Nord',
    nameEn: 'Far North',
    code: 'EN',
    coordinates: { lat: 10.5000, lng: 14.5000 },
    bounds: { north: 13.1, south: 8.0, east: 16.2, west: 13.0 },
    departments: [
      {
        name: 'Diamaré',
        nameFr: 'Diamaré',
        nameEn: 'Diamare',
        code: 'DIA',
        region: 'Extrême-Nord',
        coordinates: { lat: 10.5833, lng: 14.2167 },
        communes: [
          { name: 'Maroua 1er', nameFr: 'Maroua 1er', nameEn: 'Maroua 1st', code: 'MAR1', department: 'Diamaré', coordinates: { lat: 10.5833, lng: 14.3167 } },
          { name: 'Maroua 2ème', nameFr: 'Maroua 2ème', nameEn: 'Maroua 2nd', code: 'MAR2', department: 'Diamaré', coordinates: { lat: 10.5833, lng: 14.3000 } },
          { name: 'Maroua 3ème', nameFr: 'Maroua 3ème', nameEn: 'Maroua 3rd', code: 'MAR3', department: 'Diamaré', coordinates: { lat: 10.6000, lng: 14.3167 } }
        ]
      },
      {
        name: 'Mayo-Danay',
        nameFr: 'Mayo-Danay',
        nameEn: 'Mayo-Danay',
        code: 'MD',
        region: 'Extrême-Nord',
        coordinates: { lat: 10.8333, lng: 14.9167 },
        communes: [
          { name: 'Yagoua', nameFr: 'Yagoua', nameEn: 'Yagoua', code: 'YAG', department: 'Mayo-Danay', coordinates: { lat: 10.3333, lng: 15.2333 } },
          { name: 'Wina', nameFr: 'Wina', nameEn: 'Wina', code: 'WIN', department: 'Mayo-Danay', coordinates: { lat: 10.9000, lng: 14.8333 } }
        ]
      }
    ]
  },
  {
    name: 'Littoral',
    nameFr: 'Littoral',
    nameEn: 'Littoral',
    code: 'LT',
    coordinates: { lat: 4.0511, lng: 9.7679 },
    bounds: { north: 5.2, south: 2.2, east: 11.5, west: 8.5 },
    departments: [
      {
        name: 'Wouri',
        nameFr: 'Wouri',
        nameEn: 'Wouri',
        code: 'WR',
        region: 'Littoral',
        coordinates: { lat: 4.0511, lng: 9.7679 },
        communes: [
          { name: 'Douala 1er', nameFr: 'Douala 1er', nameEn: 'Douala 1st', code: 'DLA1', department: 'Wouri', coordinates: { lat: 4.0511, lng: 9.7679 } },
          { name: 'Douala 2ème', nameFr: 'Douala 2ème', nameEn: 'Douala 2nd', code: 'DLA2', department: 'Wouri', coordinates: { lat: 4.0611, lng: 9.7579 } },
          { name: 'Douala 3ème', nameFr: 'Douala 3ème', nameEn: 'Douala 3rd', code: 'DLA3', department: 'Wouri', coordinates: { lat: 4.0411, lng: 9.7779 } },
          { name: 'Douala 4ème', nameFr: 'Douala 4ème', nameEn: 'Douala 4th', code: 'DLA4', department: 'Wouri', coordinates: { lat: 4.0311, lng: 9.7879 } },
          { name: 'Douala 5ème', nameFr: 'Douala 5ème', nameEn: 'Douala 5th', code: 'DLA5', department: 'Wouri', coordinates: { lat: 4.0711, lng: 9.7479 } }
        ]
      },
      {
        name: 'Nkam',
        nameFr: 'Nkam',
        nameEn: 'Nkam',
        code: 'NKM',
        region: 'Littoral',
        coordinates: { lat: 4.6167, lng: 9.9500 },
        communes: [
          { name: 'Yabassi', nameFr: 'Yabassi', nameEn: 'Yabassi', code: 'YAB', department: 'Nkam', coordinates: { lat: 4.4500, lng: 9.9667 } },
          { name: 'Nkondjock', nameFr: 'Nkondjock', nameEn: 'Nkondjock', code: 'NKD', department: 'Nkam', coordinates: { lat: 4.6167, lng: 9.9500 } }
        ]
      }
    ]
  },
  {
    name: 'Nord',
    nameFr: 'Nord',
    nameEn: 'North',
    code: 'NO',
    coordinates: { lat: 8.5000, lng: 13.5000 },
    bounds: { north: 10.0, south: 6.5, east: 15.8, west: 11.5 },
    departments: [
      {
        name: 'Bénoué',
        nameFr: 'Bénoué',
        nameEn: 'Benoue',
        code: 'BEN',
        region: 'Nord',
        coordinates: { lat: 8.5000, lng: 13.6667 },
        communes: [
          { name: 'Garoua 1er', nameFr: 'Garoua 1er', nameEn: 'Garoua 1st', code: 'GAR1', department: 'Bénoué', coordinates: { lat: 9.3000, lng: 13.4000 } },
          { name: 'Garoua 2ème', nameFr: 'Garoua 2ème', nameEn: 'Garoua 2nd', code: 'GAR2', department: 'Bénoué', coordinates: { lat: 9.3167, lng: 13.3833 } },
          { name: 'Garoua 3ème', nameFr: 'Garoua 3ème', nameEn: 'Garoua 3rd', code: 'GAR3', department: 'Bénoué', coordinates: { lat: 9.2833, lng: 13.4167 } }
        ]
      },
      {
        name: 'Faro',
        nameFr: 'Faro',
        nameEn: 'Faro',
        code: 'FAR',
        region: 'Nord',
        coordinates: { lat: 8.3333, lng: 12.3667 },
        communes: [
          { name: 'Poli', nameFr: 'Poli', nameEn: 'Poli', code: 'POL', department: 'Faro', coordinates: { lat: 8.4167, lng: 13.2500 } },
          { name: 'Tcholliré', nameFr: 'Tcholliré', nameEn: 'Tchollire', code: 'TCH', department: 'Faro', coordinates: { lat: 8.3833, lng: 14.1667 } }
        ]
      }
    ]
  },
  {
    name: 'Nord-Ouest',
    nameFr: 'Nord-Ouest',
    nameEn: 'North West',
    code: 'NO',
    coordinates: { lat: 6.2000, lng: 10.2000 },
    bounds: { north: 7.2, south: 5.4, east: 11.2, west: 8.8 },
    departments: [
      {
        name: 'Mezam',
        nameFr: 'Mezam',
        nameEn: 'Mezam',
        code: 'MEZ',
        region: 'Nord-Ouest',
        coordinates: { lat: 5.9667, lng: 10.1500 },
        communes: [
          { name: 'Bamenda 1er', nameFr: 'Bamenda 1er', nameEn: 'Bamenda 1st', code: 'BAM1', department: 'Mezam', coordinates: { lat: 5.9597, lng: 10.1486 } },
          { name: 'Bamenda 2ème', nameFr: 'Bamenda 2ème', nameEn: 'Bamenda 2nd', code: 'BAM2', department: 'Mezam', coordinates: { lat: 5.9736, lng: 10.1583 } },
          { name: 'Bamenda 3ème', nameFr: 'Bamenda 3ème', nameEn: 'Bamenda 3rd', code: 'BAM3', department: 'Mezam', coordinates: { lat: 5.9458, lng: 10.1389 } }
        ]
      },
      {
        name: 'Boyo',
        nameFr: 'Boyo',
        nameEn: 'Boyo',
        code: 'BOY',
        region: 'Nord-Ouest',
        coordinates: { lat: 6.2500, lng: 10.4167 },
        communes: [
          { name: 'Fundong', nameFr: 'Fundong', nameEn: 'Fundong', code: 'FUN', department: 'Boyo', coordinates: { lat: 6.2333, lng: 10.2833 } },
          { name: 'Njinikom', nameFr: 'Njinikom', nameEn: 'Njinikom', code: 'NJI', department: 'Boyo', coordinates: { lat: 6.2167, lng: 10.3667 } }
        ]
      }
    ]
  },
  {
    name: 'Ouest',
    nameFr: 'Ouest',
    nameEn: 'West',
    code: 'OU',
    coordinates: { lat: 5.4737, lng: 10.4176 },
    bounds: { north: 6.3, south: 4.8, east: 11.2, west: 9.4 },
    departments: [
      {
        name: 'Mifi',
        nameFr: 'Mifi',
        nameEn: 'Mifi',
        code: 'MI',
        region: 'Ouest',
        coordinates: { lat: 5.4737, lng: 10.4176 },
        communes: [
          { name: 'Bafoussam 1er', nameFr: 'Bafoussam 1er', nameEn: 'Bafoussam 1st', code: 'BAF1', department: 'Mifi', coordinates: { lat: 5.4737, lng: 10.4176 } },
          { name: 'Bafoussam 2ème', nameFr: 'Bafoussam 2ème', nameEn: 'Bafoussam 2nd', code: 'BAF2', department: 'Mifi', coordinates: { lat: 5.4837, lng: 10.4076 } },
          { name: 'Bafoussam 3ème', nameFr: 'Bafoussam 3ème', nameEn: 'Bafoussam 3rd', code: 'BAF3', department: 'Mifi', coordinates: { lat: 5.4637, lng: 10.4276 } }
        ]
      },
      {
        name: 'Bamboutos',
        nameFr: 'Bamboutos',
        nameEn: 'Bamboutos',
        code: 'BAM',
        region: 'Ouest',
        coordinates: { lat: 5.5833, lng: 10.0833 },
        communes: [
          { name: 'Mbouda', nameFr: 'Mbouda', nameEn: 'Mbouda', code: 'MBO', department: 'Bamboutos', coordinates: { lat: 5.6167, lng: 10.2500 } },
          { name: 'Galim', nameFr: 'Galim', nameEn: 'Galim', code: 'GAL', department: 'Bamboutos', coordinates: { lat: 5.5500, lng: 10.1167 } }
        ]
      }
    ]
  },
  {
    name: 'Sud',
    nameFr: 'Sud',
    nameEn: 'South',
    code: 'SU',
    coordinates: { lat: 2.9167, lng: 11.5167 },
    bounds: { north: 4.0, south: 1.7, east: 16.2, west: 9.4 },
    departments: [
      {
        name: 'Mvila',
        nameFr: 'Mvila',
        nameEn: 'Mvila',
        code: 'MVI',
        region: 'Sud',
        coordinates: { lat: 2.9167, lng: 11.5167 },
        communes: [
          { name: 'Ebolowa 1er', nameFr: 'Ebolowa 1er', nameEn: 'Ebolowa 1st', code: 'EBO1', department: 'Mvila', coordinates: { lat: 2.9167, lng: 11.1500 } },
          { name: 'Ebolowa 2ème', nameFr: 'Ebolowa 2ème', nameEn: 'Ebolowa 2nd', code: 'EBO2', department: 'Mvila', coordinates: { lat: 2.9000, lng: 11.1667 } }
        ]
      },
      {
        name: 'Océan',
        nameFr: 'Océan',
        nameEn: 'Ocean',
        code: 'OCE',
        region: 'Sud',
        coordinates: { lat: 2.6833, lng: 9.9167 },
        communes: [
          { name: 'Kribi', nameFr: 'Kribi', nameEn: 'Kribi', code: 'KRI', department: 'Océan', coordinates: { lat: 2.9333, lng: 9.9167 } },
          { name: 'Campo', nameFr: 'Campo', nameEn: 'Campo', code: 'CAM', department: 'Océan', coordinates: { lat: 2.3667, lng: 9.8167 } }
        ]
      }
    ]
  },
  {
    name: 'Sud-Ouest',
    nameFr: 'Sud-Ouest',
    nameEn: 'South West',
    code: 'SO',
    coordinates: { lat: 4.1500, lng: 9.2500 },
    bounds: { north: 6.2, south: 1.7, east: 10.5, west: 8.3 },
    departments: [
      {
        name: 'Fako',
        nameFr: 'Fako',
        nameEn: 'Fako',
        code: 'FAK',
        region: 'Sud-Ouest',
        coordinates: { lat: 4.1500, lng: 9.2500 },
        communes: [
          { name: 'Buea', nameFr: 'Buea', nameEn: 'Buea', code: 'BUE', department: 'Fako', coordinates: { lat: 4.1500, lng: 9.2500 } },
          { name: 'Limbe 1er', nameFr: 'Limbe 1er', nameEn: 'Limbe 1st', code: 'LIM1', department: 'Fako', coordinates: { lat: 4.0167, lng: 9.2000 } },
          { name: 'Limbe 2ème', nameFr: 'Limbe 2ème', nameEn: 'Limbe 2nd', code: 'LIM2', department: 'Fako', coordinates: { lat: 4.0000, lng: 9.2167 } },
          { name: 'Limbe 3ème', nameFr: 'Limbe 3ème', nameEn: 'Limbe 3rd', code: 'LIM3', department: 'Fako', coordinates: { lat: 4.0333, lng: 9.1833 } }
        ]
      },
      {
        name: 'Koupé-Manengouba',
        nameFr: 'Koupé-Manengouba',
        nameEn: 'Koupe-Manengouba',
        code: 'KM',
        region: 'Sud-Ouest',
        coordinates: { lat: 4.8833, lng: 9.8333 },
        communes: [
          { name: 'Bangem', nameFr: 'Bangem', nameEn: 'Bangem', code: 'BNG', department: 'Koupé-Manengouba', coordinates: { lat: 4.8833, lng: 9.8333 } },
          { name: 'Tombel', nameFr: 'Tombel', nameEn: 'Tombel', code: 'TOM', department: 'Koupé-Manengouba', coordinates: { lat: 4.7167, lng: 9.6167 } }
        ]
      }
    ]
  }
];

export const getCommunesByRegion = (regionName: string) => {
  const region = cameroonRegions.find(r => r.name === regionName);
  if (!region) return [];
  
  return region.departments.flatMap(dept => 
    dept.communes.map(commune => ({
      ...commune,
      department: dept.name,
      region: region.name
    }))
  );
};

export const getAllCommunes = () => {
  return cameroonRegions.flatMap(region =>
    region.departments.flatMap(dept =>
      dept.communes.map(commune => ({
        ...commune,
        department: dept.name,
        region: region.name
      }))
    )
  );
};
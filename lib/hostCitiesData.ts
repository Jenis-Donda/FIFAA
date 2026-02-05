export interface HostCity {
  name: string;
  color: string;
  textColor: string;
  imageUrl?: string;
}

export interface HostCountry {
  name: string;
  flag: string;
  primaryColor: string;
  cities: HostCity[];
}

export const hostCountriesData: HostCountry[] = [
  {
    name: "Canada",
    flag: "https://api.fifa.com/api/v3/picture/flags-sq-1/CAN",
    primaryColor: "#D52B1E",
    cities: [
      { 
        name: "Toronto", 
        color: "#4F46E5", 
        textColor: "#FFFFFF",
        imageUrl: "https://digitalhub.fifa.com/m/3a3b70bed5a0e845/original/p26-grid-tor.avif"
      },
      { 
        name: "Vancouver", 
        color: "#059669", 
        textColor: "#FFFFFF",
        imageUrl: "https://digitalhub.fifa.com/m/a33b2de88070f58/original/p26-grid-van.avif"
      },
    ],
  },
  {
    name: "Mexico",
    flag: "https://api.fifa.com/api/v3/picture/flags-sq-1/MEX",
    primaryColor: "#006847",
    cities: [
      { 
        name: "Guadalajara", 
        color: "#EC4899", 
        textColor: "#FFFFFF",
        imageUrl: "https://digitalhub.fifa.com/m/6aee880405fc91d1/original/p26-grid-gua.avif"
      },
      { 
        name: "Mexico City", 
        color: "#8B5CF6", 
        textColor: "#FFFFFF",
        imageUrl: "https://digitalhub.fifa.com/m/32a3a79dffac486b/original/p26-grid-mex.avif"
      },
      { 
        name: "Monterrey", 
        color: "#1E40AF", 
        textColor: "#FFFFFF",
        imageUrl: "https://digitalhub.fifa.com/m/5f212b65a3fdeb6d/original/p26-grid-mon.avif"
      },
    ],
  },
  {
    name: "USA",
    flag: "https://api.fifa.com/api/v3/picture/flags-sq-1/USA",
    primaryColor: "#002868",
    cities: [
      { name: "Atlanta", color: "#DC2626", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/3dd0a43346075c17/original/p26-grid-atl.avif" },
      { name: "Boston", color: "#0891B2", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/6b6b5fea410741d0/original/p26-grid-bos.avif" },
      { name: "Dallas", color: "#7C3AED", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/48b7f1f7e192d6ea/original/p26-grid-dal.avif" },
      { name: "Houston", color: "#EA580C", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/53802ccbec21d06c/original/p26-grid-hou.avif" },
      { name: "Kansas City", color: "#16A34A", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/1570c011d3c35d8a/original/p26-grid-kan.avif" },
      { name: "Los Angeles", color: "#DB2777", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/695dab04642059e2/original/p26-grid-la.avif" },
      { name: "Miami", color: "#0284C7", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/41828c8d1743dea0/original/p26-grid-mia.avif" },
      { name: "New York", color: "#4338CA", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/7c4c832d38d45e81/original/p26-grid-nynj.avif" },
      { name: "Philadelphia", color: "#15803D", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/347146e138e2d2f7/original/p26-grid-phi.avif" },
      { name: "San Francisco", color: "#C026D3", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/633d071e3fbcb7be/original/p26-grid-sea.avif" },
      { name: "Seattle", color: "#0D9488", textColor: "#FFFFFF", imageUrl: "https://digitalhub.fifa.com/m/799ae3883abee92a/original/p26-grid-sf.avif" },
    ],
  },
];
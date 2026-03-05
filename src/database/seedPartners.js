// Seed Partners Data - Turkish Game Studios
import { dbOperations } from './schema.js';

const partnersData = [
    {
        name: "Dream Games",
        domain: "dreamgames.com",
        logo: "https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/ub9k9n99c7qf0e7v0q5u", // Dream Games Logo
        openJobs: 12,
        city: "İstanbul",
        isLocalPartner: true,
        description: "Royal Match'in yaratıcısı, Türkiye'nin en büyük oyun şirketlerinden biri. 5 milyar dolar değerleme ile global puzzle oyunları lideri.",
        tags: ["Mobile Casual", "Puzzle", "Unity"],
        category: "Mobile Casual",
        careerCriteria: {
            title: "Aradığımız Tasarımcı Kriterleri",
            requirements: [
                "3+ yıl mobil oyun tasarım deneyimi",
                "Puzzle ve match-3 mekaniklerinde uzmanlık",
                "Unity veya benzeri game engine deneyimi",
                "F2P monetizasyon ve LiveOps anlayışı",
                "A/B testing ve data-driven tasarım yaklaşımı"
            ],
            portfolio: "Yayınlanmış mobil oyun projeleri, GDD örnekleri ve oynanabilir prototipler",
            tools: "Unity, Figma, Miro, Analytics Tools"
        }
    },
    {
        name: "Peak Games",
        domain: "peak.com",
        logo: "https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/p7z99m_t7q4n8q9q9q9q", // Peak Logo (Approximate reliable link)
        openJobs: 8,
        city: "İstanbul",
        isLocalPartner: true,
        description: "Toy Blast ve Toon Blast'in yaratıcısı, Türkiye'nin ilk unicorn'larından. Zynga tarafından satın alındı.",
        tags: ["Mobile Casual", "Puzzle", "Match-3"],
        category: "Mobile Casual",
        careerCriteria: {
            title: "Aradığımız Tasarımcı Kriterleri",
            requirements: [
                "4+ yıl casual mobile game design deneyimi",
                "Level design ve progression sistemleri uzmanlığı",
                "Player retention ve engagement metrikleri bilgisi",
                "Scripting ve prototyping yetenekleri",
                "İngilizce iş seviyesi"
            ],
            portfolio: "Casual oyun level tasarımları, progression charts, retention analizi örnekleri",
            tools: "Unity, Excel/Google Sheets, Tableau, Jira"
        }
    },
    {
        name: "Good Job Games",
        domain: "goodjobgames.com",
        logo: "https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/v1508249822/scsy0f3z7p7p7p7p7p7p.png", // Good Job Games
        openJobs: 6,
        city: "İstanbul",
        isLocalPartner: true,
        description: "Match Villains, Wonder Blast ve Zen Match gibi hit oyunların geliştiricisi. 200+ çalışanı olan lider mobil stüdyo.",
        tags: ["Mobile Casual", "Hybrid-Casual", "Unity"],
        category: "Mobile Casual",
        careerCriteria: {
            title: "Aradığımız Tasarımcı Kriterleri",
            requirements: [
                "2+ yıl mobil oyun tasarım deneyimi",
                "Casual ve hybrid-casual oyun mekaniklerinde bilgi",
                "Rapid prototyping ve iterasyon deneyimi",
                "User acquisition ve retention stratejileri anlayışı",
                "Yaratıcı problem çözme becerileri"
            ],
            portfolio: "Mobil oyun prototipler, game design dökümanları, case study'ler",
            tools: "Unity, Figma, Analytics Platforms"
        }
    },
    {
        name: "TaleWorlds Entertainment",
        domain: "taleworlds.com",
        logo: "https://www.taleworlds.com/Content/Images/logo.png", // TaleWorlds
        openJobs: 4,
        city: "Ankara",
        isLocalPartner: true,
        description: "Mount & Blade serisinin yaratıcısı, Türkiye'nin en köklü PC/Console oyun stüdyosu.",
        tags: ["PC/Console", "RPG", "Strategy"],
        category: "PC/Console",
        careerCriteria: {
            title: "Aradığımız Tasarımcı Kriterleri",
            requirements: [
                "5+ yıl PC/Console oyun tasarım deneyimi",
                "RPG ve strateji oyun mekaniklerinde derinlemesine bilgi",
                "Combat system ve AI design deneyimi",
                "Modding community yönetimi deneyimi artı",
                "C++ veya C# bilgisi tercih sebebi"
            ],
            portfolio: "AAA veya indie PC oyun projeleri, sistem tasarım dökümanları, combat prototipler",
            tools: "Unreal Engine veya Custom Engine, Perforce, Confluence"
        }
    },
    {
        name: "Rollic",
        domain: "rollic.gs",
        logo: "https://images.crunchbase.com/image/upload/c_pad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/v1547120000/rollic_logo.png", // Rollic Placeholder
        openJobs: 10,
        city: "İstanbul",
        isLocalPartner: true,
        description: "Hypercasual oyunlarda dünya lideri, Zynga tarafından satın alındı. Hızlı prototipleme ve yayınlama odaklı.",
        tags: ["Hypercasual", "Mobile", "Rapid Prototyping"],
        category: "Hypercasual",
        careerCriteria: {
            title: "Aradığımız Tasarımcı Kriterleri",
            requirements: [
                "1+ yıl hypercasual oyun tasarım deneyimi",
                "Hızlı prototipleme ve test etme yeteneği",
                "Market trend analizi ve rekabet takibi",
                "CPI, retention, playtime metrikleri anlayışı",
                "Unity ile hızlı oyun geliştirme"
            ],
            portfolio: "Hypercasual oyun prototipler (10+ adet), test sonuçları, market analizi",
            tools: "Unity, Blender, Figma, AppLovin/ironSource"
        }
    }
];

export const seedPartners = async () => {
    try {
        const existing = await dbOperations.getAll('partners');

        for (const partner of partnersData) {
            const existingPartner = existing?.find(p => p.name === partner.name);
            if (existingPartner) {
                // Update existing to refresh logos/data
                await dbOperations.update('partners', existingPartner.id, {
                    ...partner,
                    createdAt: existingPartner.createdAt || new Date().toISOString()
                });
            } else {
                // Add new
                await dbOperations.add('partners', {
                    ...partner,
                    createdAt: new Date().toISOString()
                });
            }
        }

        console.log(`✅ Refreshed ${partnersData.length} partners with latest logos`);
    } catch (error) {
        console.error('❌ Error seeding partners:', error);
    }
};

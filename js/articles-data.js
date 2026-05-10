window.ARTICLES_DATA = [
    {
        slug: "paper-boat-in-the-wind",
        title: {
            zh: "风里的纸船",
            en: "Paper Boat in the Wind"
        },
        date: "2026-05-03",
        excerpt: {
            zh: "黄昏的河面像在慢慢呼吸，一只纸船顺着水流漂远，也把迟迟放不下的心事带走了一点。",
            en: "At dusk, the river glows softly like a long silver serpent breathing in the dark."
        },
        content: {
            zh: [
                "黄昏的河面泛着微光，像一条缓慢呼吸的银色长带。林舟蹲在岸边，把一张旧作业纸折成一只很小的纸船，纸面上还留着没写完的题目。",
                "他把纸船轻轻放进水里。它先晃了两下，随后稳住，顺着水流往下漂去。风从对岸吹来，带着青草和潮湿泥土的味道，也把胸口压着的闷意吹散了一些。",
                "他想起小时候，总会有人在放学后等他回家。那时候一句再普通不过的话，现在回想起来，也像被河水慢慢推远的回声。",
                "纸船越漂越远，最后消失在转弯处的暮色里。林舟站起身，深吸了一口气，忽然觉得有些告别并不是结束，而是换了一种方式留在身边。"
            ],
            en: [
                "At dusk, the river shimmered softly, like a long silver serpent breathing in slow rhythm. Lin Zhou crouched by the bank and folded an old worksheet into a tiny paper boat. A few unfinished math problems were still visible, their pencil marks worn pale by time.",
                "He set the boat onto the water with care. It wobbled at first, then steadied itself and followed the current downstream. Wind came from the far bank, carrying the scent of grass and wet soil, and with it some of the heaviness inside his chest drifted away.",
                "He thought of his younger self, the boy who used to wait after school for his father. His father would always smile, hand him a candy, and say, \"Let's go home. The wind is good today.\" Now that smile existed only in memory, like a reflection on the river, shattered at the slightest touch.",
                "The paper boat floated farther and disappeared into the dusk around the bend. Lin Zhou stood up and took a deep breath, as if that breath of wind still carried his father's voice. In that moment, he understood: some farewells are not endings, but another form of companionship."
            ]
        }
    },
    {
        slug: "motion-notes",
        title: {
            zh: "为什么动效要轻一点",
            en: "Why the Motion Stays Light"
        },
        date: "2026-05-02",
        excerpt: {
            zh: "关于入场节奏、滚动显现和悬停反馈，为什么都应该轻一点、慢一点、克制一点。",
            en: "A short note on why entrance timing, scroll reveal, and hover motion should stay light."
        },
        content: {
            zh: [
                "这个首页把动效当成结构，而不是装饰。第一层是首屏入场，标题和按钮按顺序出现，让页面从一开始就有节奏，而不是一下子把所有内容堆到眼前。",
                "第二层是滚动显现。每个区块轻轻向上浮出，再带一点错峰，视线会自然跟着版式移动，但不会被强迫等待。",
                "第三层是交互反馈。按钮保留很轻的位移和明暗变化，让点击前后都有回应，但不会喧宾夺主。",
                "整体原则还是克制。尽量只用 transform 和 opacity 完成主要动作，同时照顾 reduced-motion 用户，让动画服务阅读，而不是打断阅读。"
            ],
            en: [
                "This homepage treats motion as structure rather than decoration. The first layer is the hero entrance: title and calls to action appear in sequence, so the page starts with rhythm instead of dumping every element at once.",
                "The second layer is scroll reveal. Each block fades upward with a slight stagger, which guides the eye through the layout without making the reader wait.",
                "The third layer is interaction feedback. Desktop buttons keep a subtle response, while touch devices fall back to a steadier pattern so mobile still feels controlled.",
                "The rule underneath all of it is restraint. Transforms and opacity do most of the work, reduced-motion users get a quieter experience, and animation stays in service of reading."
            ]
        }
    }
];

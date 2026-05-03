window.ARTICLES_DATA = [
    {
        slug: "paper-boat-in-the-wind",
        title: {
            zh: "风中的纸船",
            en: "Paper Boat in the Wind"
        },
        date: "2026-05-03",
        excerpt: {
            zh: "黄昏的河面泛着微光，像一条缓缓呼吸的银色长蛇。",
            en: "At dusk, the river glows softly like a long silver serpent breathing in the dark."
        },
        content: {
            zh: [
                "黄昏的河面泛着微光，像一条缓缓呼吸的银色长蛇。林舟蹲在岸边，把一张旧作业纸折成一艘小船。纸上还有几道未完成的数学题，铅笔印已被岁月磨淡。",
                "他轻轻将纸船放入水中，看它被水流带走，先是摇摇晃晃，然后坚定地顺流而下。风从河对岸吹来，带着青草和泥土的气息，也带走了他心底那份沉甸甸的闷。",
                "林舟想起了多年前的自己——那个总在放学后等父亲的小男孩。父亲总会笑着递给他一颗糖，说：“回家吧，今天的风真好。”可如今，父亲的笑容只剩在记忆里，像河面上的倒影，轻轻一碰就碎了。",
                "纸船渐渐远去，消失在拐角的暮色中。林舟站起身，深吸一口气，仿佛那一口风里藏着父亲的声音。那一刻，他明白，有些告别并不是结束，而是另一种陪伴。"
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
            zh: "为什么动效要保持克制",
            en: "Why the motion stays light"
        },
        date: "2026-05-02",
        excerpt: {
            zh: "一篇关于入场节奏、滚动显现和悬浮交互为何要轻量的短文。",
            en: "A short note on the entrance timing, scroll reveal, and hover motion used on this site."
        },
        content: {
            zh: [
                "这个首页把动效当成结构，而不是装饰。第一层是首屏入场：标题带一点延迟滑入，让页面从一开始就有节奏感，而不是静止地摆在那里。",
                "第二层是滚动显现。每个区块向上淡入，并带有轻微错峰，既能让布局更有呼吸感，也不会让读者为了看内容而等待。",
                "第三层是交互反馈。按钮和图标在桌面端保留轻量的磁吸响应，到了触屏设备就回退为更简单的动效，保证移动端依然稳定。",
                "整体原则是克制。主要使用 transform 和 opacity，减少性能负担；同时照顾 reduced-motion 用户，让动画始终服务阅读，而不是打断阅读。"
            ],
            en: [
                "This homepage uses motion as structure, not decoration. The first layer is the hero entrance: the title slides in with a short delay so the page feels intentional instead of static.",
                "The second layer is scroll reveal. Each block fades upward with a small stagger, which gives the layout rhythm without making the reader wait for content.",
                "The third layer is interaction. Buttons and icons keep a light magnetic response on desktop, while touch devices fall back to simpler motion so the site still feels stable on mobile.",
                "The overall rule is restraint. Transforms and opacity do most of the work, reduced-motion users get a quieter experience, and the animation never blocks reading."
            ]
        }
    }
];

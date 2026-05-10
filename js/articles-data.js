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
                "黄昏的河面泛着微光，像一条缓缓呼吸的银色长蛇。林舟蹲在岸边，把一张旧作业纸折成一只小小的纸船。纸面上还留着几道没写完的数学题，铅笔印被岁月磨得很淡。",
                "他把纸船轻轻放进水里。它先晃了两下，随后稳稳地顺着水流向下漂去。风从对岸吹来，带着青草和潮湿泥土的气味，也顺带吹散了他心里积压许久的沉闷。",
                "他想起很多年前那个总在放学后等父亲来接的小男孩。父亲总会笑着递给他一颗糖，说：“回家吧，今天的风真好。”如今那样的笑容只剩在记忆里，像河面上的倒影，一碰就碎。",
                "纸船越漂越远，最后消失在河道转弯处的暮色里。林舟站起身，深吸了一口气，仿佛那阵风里还藏着父亲的声音。那一刻他终于明白，有些告别并不是结束，而是另一种陪伴。"
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
        slug: "button-feedback-that-breathes",
        title: {
            zh: "按钮不该只是按钮",
            en: "Buttons Should Feel Alive"
        },
        date: "2026-05-05",
        excerpt: {
            zh: "一个好按钮不只负责点击，还应该负责预期、节奏和信心。",
            en: "A good button does more than accept clicks. It sets expectation, rhythm, and confidence."
        },
        content: {
            zh: [
                "很多界面的问题，并不是按钮太少，而是按钮没有明确告诉用户下一步会发生什么。颜色、边框、阴影和文案都在传达同一件事：这里值不值得点。",
                "我更偏向把按钮做成三层反馈。第一层是静态层级，让主按钮和次按钮一眼可分；第二层是悬停或按压时的位移、发光和对比变化；第三层是动作完成后的状态反馈，比如复制成功、已收藏或已发送。",
                "真正重要的是克制。按钮不需要像广告一样大喊大叫，但也不能像普通文字一样没有重量。它应该在用户需要做决定的时候，稳稳地站出来。"
            ],
            en: [
                "Many interface problems do not come from having too few buttons. They come from buttons that fail to tell the user what happens next. Color, border, shadow, and copy all communicate the same thing: is this worth pressing?",
                "I prefer a three-layer model for button feedback. The first layer is static hierarchy, so primary and secondary actions are distinguishable at a glance. The second layer is hover or press response through movement, glow, and contrast. The third layer is completion feedback: copied, saved, sent.",
                "The key is restraint. A button does not need to shout like an ad, but it cannot feel weightless either. It should step forward exactly when the user needs to make a decision."
            ]
        }
    },
    {
        slug: "motion-notes",
        title: {
            zh: "为什么动效要保持轻盈",
            en: "Why the Motion Stays Light"
        },
        date: "2026-05-02",
        excerpt: {
            zh: "关于入场节奏、滚动显现和悬停交互为什么要轻量的一点记录。",
            en: "A short note on why entrance timing, scroll reveal, and hover motion should stay light."
        },
        content: {
            zh: [
                "这个首页把动效当成结构，而不是装饰。第一层是首屏入场：标题和按钮按顺序出现，让页面从一开始就有节奏，而不是一上来就把所有内容平铺出去。",
                "第二层是滚动显现。每个区块向上淡入，并带一点错峰，让视线自然跟着布局移动，但不会强迫读者等待。",
                "第三层是交互反馈。桌面端按钮保留轻微的磁吸感，触屏设备则回退到更稳的反馈方式，保证移动端也不会显得飘。",
                "整体原则还是克制。尽量让 transform 和 opacity 完成主要工作，同时照顾 reduced-motion 用户，让动画服务阅读，而不是打断阅读。"
            ],
            en: [
                "This homepage treats motion as structure rather than decoration. The first layer is the hero entrance: title and calls to action appear in sequence, so the page starts with rhythm instead of dumping every element at once.",
                "The second layer is scroll reveal. Each block fades upward with a slight stagger, which guides the eye through the layout without making the reader wait.",
                "The third layer is interaction feedback. Desktop buttons keep a subtle magnetic response, while touch devices fall back to a steadier pattern so mobile still feels controlled.",
                "The rule underneath all of it is restraint. Transforms and opacity do most of the work, reduced-motion users get a quieter experience, and animation stays in service of reading."
            ]
        }
    },
    {
        slug: "editing-density-on-purpose",
        title: {
            zh: "界面密度要有取舍",
            en: "Editing Interface Density on Purpose"
        },
        date: "2026-05-06",
        excerpt: {
            zh: "信息不是越多越强，层级、留白和节奏才决定页面会不会让人继续看下去。",
            en: "More information does not automatically make a stronger page. Hierarchy, whitespace, and rhythm decide whether someone keeps reading."
        },
        content: {
            zh: [
                "设计信息密度时，最容易犯的错误是把所有东西都放进首屏。这样看起来很“完整”，但用户会在真正开始阅读之前先被迫做太多判断。",
                "我更喜欢先把信息分层：首屏只回答这是什么、值不值得看、下一步去哪；列表页负责筛选和比较；详情页则让内容本身拿走注意力。",
                "当密度被编辑过，按钮会更清楚，留白会更有力量，动画也会更像呼吸而不是噪音。页面不需要更吵，它需要更准。"
            ],
            en: [
                "The easiest mistake in density design is to push everything into the first viewport. It looks complete, but it forces the user to make too many decisions before they have started reading.",
                "I prefer to layer the information. The hero should answer what this is, whether it is worth attention, and where to go next. The archive page handles filtering and comparison. The detail page lets the writing itself take over.",
                "Once density has been edited on purpose, buttons become clearer, whitespace gains weight, and animation starts to feel like breathing instead of noise. A page does not need to get louder. It needs to get sharper."
            ]
        }
    }
];

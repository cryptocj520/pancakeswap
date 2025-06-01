// PancakeSwap V3 流动性添加配置文件
// 支持单边和双边流动性模式 + 高度自定义功能

/**
 * 🔧 快速配置选择
 * 
 * 使用方法：修改下面的 CURRENT_CONFIG 来切换不同模式
 * 🆕 新增：支持自定义区间、自定义池子、自定义金额
 */

// 🎯 高级自定义配置示例

// 配置选项1：自定义USDC/WBNB池子 + 自定义区间
const CUSTOM_USDC_CONFIG = {
    liquidityMode: 'single',
    singleSideToken: 'USDC',
    
    // 🆕 自定义池子配置
    customPool: {
        token0: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
        token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        fee: 500, // 0.05%
        token0Symbol: 'USDC',
        token1Symbol: 'WBNB'
    },
    
    // 🆕 自定义金额
    customAmounts: {
        token0Amount: '10', // 10 USDC
        token1Amount: '0.01', // 0.01 WBNB
        token0Decimals: 18,
        token1Decimals: 18
    },
    
    // 🆕 自定义价格区间 (绝对tick值)
    customRange: {
        enabled: true,
        tickLower: -200, // 相对当前价格
        tickUpper: -50,  // 相对当前价格
        rangeType: 'relative' // 'relative' | 'absolute'
    },
    
    description: '自定义配置 - USDC/WBNB池子，自定义区间'
};

// 配置选项2：自定义BUSD池子 + 百分比区间
const CUSTOM_BUSD_CONFIG = {
    liquidityMode: 'double',
    singleSideToken: null,
    
    // 🆕 自定义池子
    customPool: {
        token0: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', // BUSD
        token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        fee: 100, // 0.01%
        token0Symbol: 'BUSD',
        token1Symbol: 'WBNB'
    },
    
    // 🆕 自定义金额
    customAmounts: {
        token0Amount: '50', // 50 BUSD
        token1Amount: '0.05', // 0.05 WBNB
        token0Decimals: 18,
        token1Decimals: 18
    },
    
    // 🆕 百分比价格区间
    customRange: {
        enabled: true,
        lowerPercent: -2, // 低于当前价格2%
        upperPercent: 2,  // 高于当前价格2%
        rangeType: 'percentage' // 'relative' | 'absolute' | 'percentage'
    },
    
    description: '自定义配置 - BUSD/WBNB池子，±2%价格区间'
};

// 配置选项3：默认USDT配置（简化版）
const SIMPLE_USDT_CONFIG = {
    liquidityMode: 'single',
    singleSideToken: 'USDT',
    usdtAmount: '0.1',
    wbnbAmount: '0.0001',
    description: '简单配置 - 使用默认USDT/WBNB池子'
};

// 配置选项4：默认双边配置（原有模式）
const SIMPLE_DOUBLE_CONFIG = {
    liquidityMode: 'double',
    singleSideToken: null,
    usdtAmount: '0.1',
    wbnbAmount: '0.0001',
    description: '默认双边流动性'
};

// 配置选项5：单边WBNB + 自定义区间
const CUSTOM_WBNB_CONFIG = {
    liquidityMode: 'single',
    singleSideToken: 'WBNB',
    
    // 使用默认池子，但自定义金额和区间
    customAmounts: {
        token0Amount: '0.5', // 0.5 USDT
        token1Amount: '0.001', // 0.001 WBNB  
        token0Decimals: 18,
        token1Decimals: 18
    },
    
    // 自定义区间 - 看跌策略
    customRange: {
        enabled: true,
        lowerPercent: -5, // 低于当前价格5%
        upperPercent: -1, // 低于当前价格1%
        rangeType: 'percentage'
    },
    
    description: '单边WBNB + 自定义看跌区间(-5%~-1%)'
};

// 🎯 当前使用的配置（修改这里来切换模式）
const CURRENT_CONFIG = SIMPLE_USDT_CONFIG; // 🔄 在这里切换配置

// 基础默认配置（当没有自定义配置时使用）
const BASE_DEFAULT_CONFIG = {
    // 默认池子信息
    defaultPool: {
        token0: '0x55d398326f99059fF775485246999027B3197955', // USDT
        token1: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
        fee: 100, // 0.01%
        token0Symbol: 'USDT',
        token1Symbol: 'WBNB'
    },
    
    // 默认金额
    defaultAmounts: {
        token0Amount: '0.1', // 0.1 USDT
        token1Amount: '0.0001', // 0.0001 WBNB
        token0Decimals: 18,
        token1Decimals: 18
    },
    
    // 默认价格区间策略
    defaultRange: {
        enabled: false, // 使用智能区间计算
        doubleRangePercent: 0.5, // 双边流动性：±0.5%
        singleRangeOffset: {
            USDT: { lower: 10, upper: 200 }, // USDT单边：当前价格+10到+200 tick
            WBNB: { lower: -200, upper: -10 }, // WBNB单边：当前价格-200到-10 tick
            USDC: { lower: 10, upper: 200 },
            BUSD: { lower: 10, upper: 200 }
        }
    },
    
    // 基础配置
    priceRangePercent: 3,
    tickSpacing: 1,
    executionMethod: 'direct' // 'direct' | 'multicall'
};

/**
 * 🔄 配置合并函数
 * 优先级：CURRENT_CONFIG > BASE_DEFAULT_CONFIG
 */
function mergeConfigs(userConfig, defaultConfig) {
    const merged = { ...defaultConfig, ...userConfig };
    
    // 智能合并池子信息
    if (userConfig.customPool) {
        merged.poolConfig = userConfig.customPool;
    } else {
        merged.poolConfig = defaultConfig.defaultPool;
        // 向后兼容：如果有老的token0/token1配置
        if (userConfig.token0 && userConfig.token1) {
            merged.poolConfig.token0 = userConfig.token0;
            merged.poolConfig.token1 = userConfig.token1;
            merged.poolConfig.fee = userConfig.fee || defaultConfig.defaultPool.fee;
        }
    }
    
    // 智能合并金额信息
    if (userConfig.customAmounts) {
        merged.amountConfig = userConfig.customAmounts;
    } else {
        merged.amountConfig = defaultConfig.defaultAmounts;
        // 向后兼容：如果有老的金额配置
        if (userConfig.usdtAmount || userConfig.wbnbAmount) {
            merged.amountConfig.token0Amount = userConfig.usdtAmount || userConfig.token0Amount || defaultConfig.defaultAmounts.token0Amount;
            merged.amountConfig.token1Amount = userConfig.wbnbAmount || userConfig.token1Amount || defaultConfig.defaultAmounts.token1Amount;
        }
    }
    
    // 智能合并区间信息
    if (userConfig.customRange && userConfig.customRange.enabled) {
        merged.rangeConfig = userConfig.customRange;
    } else {
        merged.rangeConfig = defaultConfig.defaultRange;
    }
    
    return merged;
}

// 合并最终配置
export const LIQUIDITY_CONFIG = mergeConfigs(CURRENT_CONFIG, BASE_DEFAULT_CONFIG);

// 配置信息展示
console.log(`\n🎯 当前配置: ${CURRENT_CONFIG.description}`);
console.log(`📋 配置详情:`);
console.log(`   流动性模式: ${LIQUIDITY_CONFIG.liquidityMode === 'single' ? '单边' : '双边'}`);
if (LIQUIDITY_CONFIG.liquidityMode === 'single') {
    console.log(`   选择代币: ${LIQUIDITY_CONFIG.singleSideToken}`);
}
console.log(`   池子: ${LIQUIDITY_CONFIG.poolConfig.token0Symbol}/${LIQUIDITY_CONFIG.poolConfig.token1Symbol}`);
console.log(`   费率: ${LIQUIDITY_CONFIG.poolConfig.fee} (${LIQUIDITY_CONFIG.poolConfig.fee/10000}%)`);
console.log(`   金额: ${LIQUIDITY_CONFIG.amountConfig.token0Amount} ${LIQUIDITY_CONFIG.poolConfig.token0Symbol} + ${LIQUIDITY_CONFIG.amountConfig.token1Amount} ${LIQUIDITY_CONFIG.poolConfig.token1Symbol}`);
if (LIQUIDITY_CONFIG.rangeConfig.enabled) {
    console.log(`   价格区间: 自定义 (${LIQUIDITY_CONFIG.rangeConfig.rangeType})`);
} else {
    console.log(`   价格区间: 智能计算`);
}
console.log(`   执行方法: ${LIQUIDITY_CONFIG.executionMethod === 'direct' ? '直接调用' : 'Multicall'}`);

console.log(`\n🔄 快速切换说明:`);
console.log(`   修改 CURRENT_CONFIG 变量来切换配置:`);
console.log(`   - SIMPLE_USDT_CONFIG     (简单USDT模式)`);
console.log(`   - SIMPLE_DOUBLE_CONFIG   (简单双边模式)`);
console.log(`   - CUSTOM_USDC_CONFIG     (自定义USDC池子)`);
console.log(`   - CUSTOM_BUSD_CONFIG     (自定义BUSD池子)`);
console.log(`   - CUSTOM_WBNB_CONFIG     (自定义WBNB看跌)`);

// 预定义配置导出
export const CONFIGS = {
    SIMPLE_USDT: SIMPLE_USDT_CONFIG,
    SIMPLE_DOUBLE: SIMPLE_DOUBLE_CONFIG,
    CUSTOM_USDC: CUSTOM_USDC_CONFIG,
    CUSTOM_BUSD: CUSTOM_BUSD_CONFIG,
    CUSTOM_WBNB: CUSTOM_WBNB_CONFIG
};

// 🆕 配置验证函数
export function validateConfig(config) {
    const errors = [];
    
    // 验证流动性模式
    if (!['single', 'double'].includes(config.liquidityMode)) {
        errors.push('liquidityMode必须是 "single" 或 "double"');
    }
    
    // 验证单边模式的代币选择
    if (config.liquidityMode === 'single' && !config.singleSideToken) {
        errors.push('单边模式必须指定singleSideToken');
    }
    
    // 验证池子配置
    if (!config.poolConfig.token0 || !config.poolConfig.token1) {
        errors.push('必须提供完整的池子配置 (token0, token1)');
    }
    
    // 验证金额配置
    if (!config.amountConfig.token0Amount || !config.amountConfig.token1Amount) {
        errors.push('必须提供完整的金额配置');
    }
    
    // 验证自定义区间
    if (config.rangeConfig.enabled) {
        if (config.rangeConfig.rangeType === 'percentage') {
            if (config.rangeConfig.lowerPercent >= config.rangeConfig.upperPercent) {
                errors.push('价格区间：lowerPercent必须小于upperPercent');
            }
        } else if (config.rangeConfig.rangeType === 'relative') {
            if (config.rangeConfig.tickLower >= config.rangeConfig.tickUpper) {
                errors.push('价格区间：tickLower必须小于tickUpper');
            }
        }
    }
    
    return errors;
}

// 验证当前配置
const configErrors = validateConfig(LIQUIDITY_CONFIG);
if (configErrors.length > 0) {
    console.log(`\n❌ 配置验证失败:`);
    configErrors.forEach(error => console.log(`   - ${error}`));
} else {
    console.log(`\n✅ 配置验证通过`);
} 
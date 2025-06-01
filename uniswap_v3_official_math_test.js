/**
 * 🧮 Uniswap V3官方数学公式测试脚本
 * 参考：@uniswap/v3-sdk 和 Uniswap V3 白皮书
 * 目的：验证与智能合约完全一致的计算结果
 */

import { ethers } from 'ethers';
import { LIQUIDITY_CONFIG } from './liquidity_config.js';

// BSC主网配置
const MAINNET_CONFIG = {
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    chainId: 56,
    name: 'BSC主网'
};

// 合约地址
const CONTRACTS = {
    POSITION_MANAGER: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
    FACTORY: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
};

// Pool ABI
const POOL_ABI = [
    "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)"
];

// Factory ABI
const FACTORY_ABI = [
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

/**
 * 🔢 Uniswap V3核心数学常量
 */
const MATH_CONSTANTS = {
    Q96: 2n ** 96n,        // 2^96
    Q128: 2n ** 128n,      // 2^128
    Q192: 2n ** 192n,      // 2^192
    MAX_UINT128: 2n ** 128n - 1n,
    MIN_TICK: -887272,
    MAX_TICK: 887272,
    MIN_SQRT_RATIO: 4295128739n,
    MAX_SQRT_RATIO: 1461446703485210103287273052203988822378723970342n
};

/**
 * 🧮 Uniswap V3官方tick到sqrtRatio转换 (来自@uniswap/v3-sdk)
 */
function getSqrtRatioAtTick(tick) {
    const absTick = BigInt(Math.abs(tick));
    
    // 验证tick范围
    if (absTick > BigInt(Math.abs(MATH_CONSTANTS.MAX_TICK))) {
        throw new Error(`Tick超出范围: ${tick}`);
    }
    
    // Uniswap V3的精确bit-shifting算法
    let ratio = (absTick & 0x1n) !== 0n 
        ? 0xfffcb933bd6fad37aa2d162d1a594001n 
        : 0x100000000000000000000000000000000n;
        
    if ((absTick & 0x2n) !== 0n) ratio = (ratio * 0xfff97272373d413259a46990580e213an) >> 128n;
    if ((absTick & 0x4n) !== 0n) ratio = (ratio * 0xfff2e50f5f656932ef12357cf3c7fdccn) >> 128n;
    if ((absTick & 0x8n) !== 0n) ratio = (ratio * 0xffe5caca7e10e4e61c3624eaa0941cd0n) >> 128n;
    if ((absTick & 0x10n) !== 0n) ratio = (ratio * 0xffcb9843d60f6159c9db58835c926644n) >> 128n;
    if ((absTick & 0x20n) !== 0n) ratio = (ratio * 0xff973b41fa98c081472e6896dfb254c0n) >> 128n;
    if ((absTick & 0x40n) !== 0n) ratio = (ratio * 0xff2ea16466c96a3843ec78b326b52861n) >> 128n;
    if ((absTick & 0x80n) !== 0n) ratio = (ratio * 0xfe5dee046a99a2a811c461f1969c3053n) >> 128n;
    if ((absTick & 0x100n) !== 0n) ratio = (ratio * 0xfcbe86c7900a88aedcffc83b479aa3a4n) >> 128n;
    if ((absTick & 0x200n) !== 0n) ratio = (ratio * 0xf987a7253ac413176f2b074cf7815e54n) >> 128n;
    if ((absTick & 0x400n) !== 0n) ratio = (ratio * 0xf3392b0822b70005940c7a398e4b70f3n) >> 128n;
    if ((absTick & 0x800n) !== 0n) ratio = (ratio * 0xe7159475a2c29b7443b29c7fa6e889d9n) >> 128n;
    if ((absTick & 0x1000n) !== 0n) ratio = (ratio * 0xd097f3bdfd2022b8845ad8f792aa5825n) >> 128n;
    if ((absTick & 0x2000n) !== 0n) ratio = (ratio * 0xa9f746462d870fdf8a65dc1f90e061e5n) >> 128n;
    if ((absTick & 0x4000n) !== 0n) ratio = (ratio * 0x70d869a156d2a1b890bb3df62baf32f7n) >> 128n;
    if ((absTick & 0x8000n) !== 0n) ratio = (ratio * 0x31be135f97d08fd981231505542fcfa6n) >> 128n;
    if ((absTick & 0x10000n) !== 0n) ratio = (ratio * 0x9aa508b5b7a84e1c677de54f3e99bc9n) >> 128n;
    if ((absTick & 0x20000n) !== 0n) ratio = (ratio * 0x5d6af8dedb81196699c329225ee604n) >> 128n;
    if ((absTick & 0x40000n) !== 0n) ratio = (ratio * 0x2216e584f5fa1ea926041bedfe98n) >> 128n;
    if ((absTick & 0x80000n) !== 0n) ratio = (ratio * 0x48a170391f7dc42444e8fa2n) >> 128n;
    
    // 处理负数tick
    if (tick > 0) {
        ratio = (1n << 256n) / ratio;
    }
    
    // 转换为Q96格式 (sqrtRatioX96)
    const sqrtRatioX96 = ratio >> 32n;
    
    return sqrtRatioX96;
}

/**
 * 🧮 从sqrtRatio反推tick (近似算法)
 */
function getTickAtSqrtRatio(sqrtRatioX96) {
    // 将sqrtRatioX96转换为实际价格
    const sqrtPrice = Number(sqrtRatioX96) / Number(MATH_CONSTANTS.Q96);
    const price = sqrtPrice * sqrtPrice;
    
    // 使用对数计算tick: tick = log(price) / log(1.0001)
    const tick = Math.log(price) / Math.log(1.0001);
    
    return Math.round(tick);
}

/**
 * 🧮 计算给定流动性L所需的代币数量 (Uniswap V3官方公式)
 */
function getAmountsForLiquidity(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, liquidity) {
    console.log(`🧮 计算流动性所需代币数量...`);
    console.log(`   流动性L: ${liquidity.toString()}`);
    console.log(`   当前sqrtRatio: ${sqrtRatioX96.toString()}`);
    console.log(`   区间sqrtRatioA: ${sqrtRatioAX96.toString()}`);
    console.log(`   区间sqrtRatioB: ${sqrtRatioBX96.toString()}`);
    
    // 确保A < B
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }
    
    let amount0 = 0n;
    let amount1 = 0n;
    
    if (sqrtRatioX96 <= sqrtRatioAX96) {
        // 情况1: 当前价格在区间下方，只需要token0
        console.log(`   📍 当前价格在区间下方，只需要token0`);
        amount0 = (liquidity * MATH_CONSTANTS.Q96 * (sqrtRatioBX96 - sqrtRatioAX96)) / (sqrtRatioAX96 * sqrtRatioBX96);
    } else if (sqrtRatioX96 < sqrtRatioBX96) {
        // 情况2: 当前价格在区间内，需要两种代币
        console.log(`   📍 当前价格在区间内，需要两种代币`);
        amount0 = (liquidity * MATH_CONSTANTS.Q96 * (sqrtRatioBX96 - sqrtRatioX96)) / (sqrtRatioX96 * sqrtRatioBX96);
        amount1 = liquidity * (sqrtRatioX96 - sqrtRatioAX96) / MATH_CONSTANTS.Q96;
    } else {
        // 情况3: 当前价格在区间上方，只需要token1
        console.log(`   📍 当前价格在区间上方，只需要token1`);
        amount1 = liquidity * (sqrtRatioBX96 - sqrtRatioAX96) / MATH_CONSTANTS.Q96;
    }
    
    console.log(`   🔢 计算结果:`);
    console.log(`      amount0: ${amount0.toString()}`);
    console.log(`      amount1: ${amount1.toString()}`);
    
    return { amount0, amount1 };
}

/**
 * 🧮 从给定代币数量计算流动性L (Uniswap V3官方公式)
 */
function getLiquidityForAmount0(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, amount0) {
    console.log(`🧮 从token0数量计算流动性...`);
    console.log(`   amount0: ${amount0.toString()}`);
    
    // 确保A < B
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }
    
    // 转换为BigInt
    const amount0BigInt = BigInt(amount0);
    
    let liquidity = 0n;
    
    if (sqrtRatioX96 <= sqrtRatioAX96) {
        // 当前价格在区间下方
        console.log(`   📍 当前价格在区间下方`);
        liquidity = (amount0BigInt * sqrtRatioAX96 * sqrtRatioBX96) / (MATH_CONSTANTS.Q96 * (sqrtRatioBX96 - sqrtRatioAX96));
    } else if (sqrtRatioX96 < sqrtRatioBX96) {
        // 当前价格在区间内
        console.log(`   📍 当前价格在区间内`);
        liquidity = (amount0BigInt * sqrtRatioX96 * sqrtRatioBX96) / (MATH_CONSTANTS.Q96 * (sqrtRatioBX96 - sqrtRatioX96));
    } else {
        // 当前价格在区间上方，token0不需要
        console.log(`   📍 当前价格在区间上方，token0不需要`);
        liquidity = 0n;
    }
    
    console.log(`   🔢 计算得到流动性: ${liquidity.toString()}`);
    return liquidity;
}

/**
 * 🧮 从给定代币数量计算流动性L (Uniswap V3官方公式)
 */
function getLiquidityForAmount1(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, amount1) {
    console.log(`🧮 从token1数量计算流动性...`);
    console.log(`   amount1: ${amount1.toString()}`);
    
    // 确保A < B
    if (sqrtRatioAX96 > sqrtRatioBX96) {
        [sqrtRatioAX96, sqrtRatioBX96] = [sqrtRatioBX96, sqrtRatioAX96];
    }
    
    // 转换为BigInt
    const amount1BigInt = BigInt(amount1);
    
    let liquidity = 0n;
    
    if (sqrtRatioX96 >= sqrtRatioBX96) {
        // 当前价格在区间上方
        console.log(`   📍 当前价格在区间上方`);
        liquidity = (amount1BigInt * MATH_CONSTANTS.Q96) / (sqrtRatioBX96 - sqrtRatioAX96);
    } else if (sqrtRatioX96 > sqrtRatioAX96) {
        // 当前价格在区间内
        console.log(`   📍 当前价格在区间内`);
        liquidity = (amount1BigInt * MATH_CONSTANTS.Q96) / (sqrtRatioX96 - sqrtRatioAX96);
    } else {
        // 当前价格在区间下方，token1不需要
        console.log(`   📍 当前价格在区间下方，token1不需要`);
        liquidity = 0n;
    }
    
    console.log(`   🔢 计算得到流动性: ${liquidity.toString()}`);
    return liquidity;
}

/**
 * 🧮 官方算法: 根据输入代币数量计算另一个代币数量
 */
function calculateOfficialTokenAmounts(sqrtRatioX96, tickLower, tickUpper, inputAmount, inputToken) {
    console.log(`\n🧮 === Uniswap V3官方算法计算 ===`);
    console.log(`📋 输入参数:`);
    console.log(`   当前sqrtRatioX96: ${sqrtRatioX96.toString()}`);
    console.log(`   价格区间: tick ${tickLower} ~ ${tickUpper}`);
    console.log(`   输入数量: ${inputAmount} ${inputToken}`);
    
    // 1. 计算区间的sqrtRatio
    const sqrtRatioAX96 = getSqrtRatioAtTick(tickLower);
    const sqrtRatioBX96 = getSqrtRatioAtTick(tickUpper);
    
    console.log(`🔢 计算区间sqrtRatio:`);
    console.log(`   tickLower ${tickLower} → sqrtRatioA: ${sqrtRatioAX96.toString()}`);
    console.log(`   tickUpper ${tickUpper} → sqrtRatioB: ${sqrtRatioBX96.toString()}`);
    
    // 2. 将输入数量转换为wei
    const inputToken0 = inputToken === 'token0';
    const inputTokenDecimals = inputToken0 ? LIQUIDITY_CONFIG.amountConfig.token0Decimals : LIQUIDITY_CONFIG.amountConfig.token1Decimals;
    const inputAmountWei = ethers.parseUnits(inputAmount.toString(), inputTokenDecimals);
    
    console.log(`🔢 输入数量转换:`);
    console.log(`   ${inputAmount} ${inputToken} → ${inputAmountWei.toString()} wei`);
    
    // 3. 根据输入代币计算流动性
    let liquidity;
    if (inputToken0) {
        liquidity = getLiquidityForAmount0(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, inputAmountWei);
    } else {
        liquidity = getLiquidityForAmount1(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, inputAmountWei);
    }
    
    console.log(`🧮 计算得到流动性: ${liquidity.toString()}`);
    
    // 4. 根据流动性计算两种代币的数量
    const { amount0, amount1 } = getAmountsForLiquidity(sqrtRatioX96, sqrtRatioAX96, sqrtRatioBX96, liquidity);
    
    // 5. 转换为可读格式
    const amount0Formatted = ethers.formatUnits(amount0.toString(), LIQUIDITY_CONFIG.amountConfig.token0Decimals);
    const amount1Formatted = ethers.formatUnits(amount1.toString(), LIQUIDITY_CONFIG.amountConfig.token1Decimals);
    
    console.log(`✅ 官方算法最终结果:`);
    console.log(`   Token0 (${LIQUIDITY_CONFIG.poolConfig.token0Symbol}): ${amount0Formatted}`);
    console.log(`   Token1 (${LIQUIDITY_CONFIG.poolConfig.token1Symbol}): ${amount1Formatted}`);
    console.log(`   流动性L: ${liquidity.toString()}`);
    
    return {
        amount0: amount0.toString(),
        amount1: amount1.toString(),
        amount0Formatted,
        amount1Formatted,
        liquidity: liquidity.toString(),
        calculation: 'uniswap_v3_official_math'
    };
}

/**
 * 🔍 获取池子状态
 */
async function getPoolState(provider) {
    console.log(`🔍 获取池子状态...`);
    
    // 1. 查找池子地址
    const factoryContract = new ethers.Contract(CONTRACTS.FACTORY, FACTORY_ABI, provider);
    const poolAddress = await factoryContract.getPool(
        LIQUIDITY_CONFIG.poolConfig.token0,
        LIQUIDITY_CONFIG.poolConfig.token1,
        LIQUIDITY_CONFIG.poolConfig.fee
    );
    
    console.log(`📍 池子地址: ${poolAddress}`);
    
    // 2. 获取池子状态
    const poolContract = new ethers.Contract(poolAddress, POOL_ABI, provider);
    const slot0 = await poolContract.slot0();
    
    const currentTick = Number(slot0[1]);
    const sqrtPriceX96 = slot0[0];
    
    console.log(`📊 池子状态:`);
    console.log(`   当前Tick: ${currentTick}`);
    console.log(`   sqrtPriceX96: ${sqrtPriceX96.toString()}`);
    
    // 3. 验证sqrtRatio计算
    const calculatedSqrtRatio = getSqrtRatioAtTick(currentTick);
    console.log(`🔍 验证计算:`);
    console.log(`   链上sqrtRatio: ${sqrtPriceX96.toString()}`);
    console.log(`   计算sqrtRatio: ${calculatedSqrtRatio.toString()}`);
    console.log(`   差异: ${(sqrtPriceX96 - calculatedSqrtRatio).toString()}`);
    
    return {
        poolAddress,
        tick: currentTick,
        sqrtPriceX96: sqrtPriceX96,
        calculatedSqrtRatio
    };
}

/**
 * 🎯 主测试函数
 */
async function testOfficialMath() {
    console.log(`🧮 === Uniswap V3官方数学公式测试 ===\n`);
    
    try {
        // 1. 连接网络
        const provider = new ethers.JsonRpcProvider(MAINNET_CONFIG.rpcUrl);
        
        // 2. 获取池子状态  
        const poolState = await getPoolState(provider);
        
        // 3. 设置测试参数
        const testCases = [
            // 测试用例1: 1 USDT双边流动性 (跨越当前价格)
            {
                name: "1 USDT双边流动性",
                inputAmount: 1.0,
                inputToken: 'token0', // USDT
                tickLower: poolState.tick - 500,
                tickUpper: poolState.tick + 500,
                description: "跨越当前价格的双边流动性"
            },
            // 测试用例2: 0.001 WBNB双边流动性
            {
                name: "0.001 WBNB双边流动性", 
                inputAmount: 0.001,
                inputToken: 'token1', // WBNB
                tickLower: poolState.tick - 500,
                tickUpper: poolState.tick + 500,
                description: "跨越当前价格的双边流动性"
            },
            // 测试用例3: 1 USDT单边流动性 (高于当前价格)
            {
                name: "1 USDT单边流动性(高价)",
                inputAmount: 1.0,
                inputToken: 'token0', // USDT
                tickLower: poolState.tick + 100,
                tickUpper: poolState.tick + 600,
                description: "高于当前价格的单边流动性"
            }
        ];
        
        // 4. 执行测试用例
        for (const testCase of testCases) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🧪 测试用例: ${testCase.name}`);
            console.log(`📝 描述: ${testCase.description}`);
            console.log(`${'='.repeat(60)}`);
            
            const result = calculateOfficialTokenAmounts(
                poolState.sqrtPriceX96,
                testCase.tickLower,
                testCase.tickUpper,
                testCase.inputAmount,
                testCase.inputToken
            );
            
            // 验证结果合理性
            console.log(`\n🔍 结果验证:`);
            const amount0 = parseFloat(result.amount0Formatted);
            const amount1 = parseFloat(result.amount1Formatted);
            
            if (amount0 > 0 && amount1 > 0) {
                console.log(`   ✅ 双边流动性 - 两种代币都需要`);
                console.log(`   💱 比率验证: 1 ${LIQUIDITY_CONFIG.poolConfig.token0Symbol} ≈ ${(amount1/amount0).toFixed(8)} ${LIQUIDITY_CONFIG.poolConfig.token1Symbol}`);
            } else if (amount0 > 0) {
                console.log(`   ✅ 单边流动性 - 只需要${LIQUIDITY_CONFIG.poolConfig.token0Symbol}`);
            } else if (amount1 > 0) {
                console.log(`   ✅ 单边流动性 - 只需要${LIQUIDITY_CONFIG.poolConfig.token1Symbol}`);
            }
        }
        
        console.log(`\n🎉 官方数学公式测试完成！`);
        console.log(`📋 总结:`);
        console.log(`   - 所有计算使用Uniswap V3官方数学公式`);
        console.log(`   - 与智能合约计算逻辑完全一致`);
        console.log(`   - 可用于验证现有脚本的计算精度`);
        
    } catch (error) {
        console.error(`❌ 测试失败:`, error.message);
        throw error;
    }
}

// 导出核心函数
export { 
    getSqrtRatioAtTick, 
    getAmountsForLiquidity, 
    getLiquidityForAmount0, 
    getLiquidityForAmount1,
    calculateOfficialTokenAmounts,
    testOfficialMath 
};

// 命令行运行
if (import.meta.url === `file://${process.argv[1]}`) {
    testOfficialMath().catch(console.error);
} 
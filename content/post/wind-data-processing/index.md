---
title: Wind数据预处理实验代码
description: Python数据处理代码,用于处理Wind金融数据
slug: wind-data-processing
date: 2024-10-15 00:00:00+0000
image: 
categories:
    - 代码备份
    - 数据处理
tags:
    - Python
    - Pandas
    - 数据预处理
    - Wind
---
Wind数据预处理的Python代码实现,包含Excel文件处理和数据清洗功能。

<!--more-->

## Wind数据预处理

```python
import pandas as pd
import numpy as np

def process_df(df, time_range=pd.date_range('2021-12-01', '2024-11-20', freq='D')):
    # 去掉前两行
    df = df.iloc[2:]
  
    # 将第三行设置为header
    df.columns = df.iloc[0]
  
    # 去掉第四行
    df = df.iloc[2:]
  
    # 将日期列设置为index
    df['日期'] = pd.to_datetime(df['日期'])
    df.set_index('日期', inplace=True)
  
    # 如果第一行第一个值不是数字则设为空
    if str(df.iloc[0, 0]).isdigit() == False:
        df.iloc[0, 0] = np.nan
  
    # 将0值改为空值
    df = df.replace(0, np.nan)
  
    # 向前填充再向后填充
    df = df.fillna(method='ffill').fillna(method='bfill')
    print(df.head())
    return df

def process_excel(input_path, output_path, sheet_names=None):
    # 读取 Excel 文件中的所有 sheet 名称
    if sheet_names is None:
        sheet_names = pd.ExcelFile(input_path).sheet_names
  
    # 处理数据
    processed_df_dict = {}
    for sheet_name in sheet_names:
        print('正在处理', sheet_name)
        df = pd.read_excel(input_path, header=None, sheet_name=sheet_name)
  
        # 移除重复的索引
        df = df.loc[~df.index.duplicated(keep='first')]
  
        # 处理数据
        processed_df = process_df(df)
        processed_df_dict[sheet_name] = processed_df
  
    # 保存到新的 Excel 文件
    with pd.ExcelWriter(output_path) as writer:
        for sheet_name, df in processed_df_dict.items():
            df.to_excel(writer, sheet_name=sheet_name)
  
    print(f'已保存到 {output_path}')

# 使用示例
if __name__ == "__main__":
    input_path = 'input.xlsx'
    output_path = 'output.xlsx'
    process_excel(input_path, output_path)
```

## 功能说明

### process_df 函数

- 清理Excel数据的前几行
- 设置正确的列标题
- 处理日期列并设为索引
- 处理缺失值和零值
- 使用前向和后向填充处理空值

### process_excel 函数

- 批量处理Excel文件中的所有工作表
- 自动检测并处理重复的索引
- 将处理后的数据保存到新文件

## 使用场景

适用于处理从Wind金融终端导出的Excel数据,特别是时间序列数据的清洗和格式化。

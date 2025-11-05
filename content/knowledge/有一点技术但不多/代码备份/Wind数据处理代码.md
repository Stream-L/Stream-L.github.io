---
title: "Wind数据处理代码"
description: "处理Wind数据的Python代码"
slug: "wind-data-processing"
date: 2025-11-05T00:00:00+08:00
image: 
math: false
license: 
hidden: false
comments: true
toc: true
draft: false
---
# Wind数据处理代码

## Wind数据预处理

```powershell
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

    # 获取公共索引
    common_index = processed_df_dict[sheet_names[0]].index
    for key in processed_df_dict:
        processed_df_dict[key] = processed_df_dict[key].reindex(common_index)

    # 输出每个 DataFrame 的 shape
    for key in processed_df_dict:
        print(f"{key} shape: {processed_df_dict[key].shape}")

    # 拼接所有 DataFrame
    df_all = pd.concat(processed_df_dict.values(), axis=1)

    print(df_all)
    print(df_all.shape)

    # 从 index 为 2021-04-03 开始
    new_start_date = pd.to_datetime('2021-04-03')
    if new_start_date in df_all.index:
        new_start_date_index = df_all.index.get_loc(new_start_date)
        df_all = df_all.iloc[new_start_date_index:]
    else:
        print(f"索引中不包含日期 {new_start_date}")

    # 向前填充
    df_all = df_all.ffill() # 老版本pandas：df_all = df_all.fillna(method='ffill')
    # 向后填充
    df_all = df_all.bfill() # 老版本pandas：df_all = df_all.fillna(method='bfill')

    # 输出为 Excel
    df_all.index.name = 'date'  # 注意可以修改为df_all.index.name = '日期'，这样输出的excel文件中的日期列为日期
    df_all.to_excel(output_path)

# 示例调用
input_path = 'Wind全部指标.xlsx'
output_path = 'test_all.xlsx'
process_excel(input_path, output_path)

output_path = 'test_part.xlsx'
sheet_names = ['Wind经济指数', 'Wind股票指数']
process_excel(input_path, output_path, sheet_names)

# 注意输出的excel文件中的日期列为date，如果需要修改可以修改df_all.index.name = 'date'这一行代码
# 如果想懒得确定，可以在之后使用pd.read_excel('test_all.xlsx',index_col=0)来读取数据，将第一列作为索引列
```

‍

‍

## CEA每日行情数据转表格

```powershell
import json
import pandas as pd


# 假设JSON文件名为 'data.json'
json_filename = 'hiskline.json'
# CSV文件名
csv_filename = 'CEA.csv'

# 读取JSON文件
with open(json_filename, 'r', encoding='utf-8') as json_file:
    # 加载JSON数据
    data = json.load(json_file)

# 转成dataframe
df = pd.DataFrame(data, columns=['日期', '开盘', '最高', '最低', '收盘', '成交量'])
# 英文列名
# df.columns = ['date', 'open', 'high', 'low', 'close', 'volume']


# 保存为csv
df.to_csv(csv_filename,encoding='utf-8-sig', index=False)

print("转换完成！")
```

‍

‍

‍

‍

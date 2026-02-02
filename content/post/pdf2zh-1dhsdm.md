---
title: Zotero PDF2ZH 插件一键配置与启动脚本使用指南
slug: pdf2zh-1dhsdm
url: /post/pdf2zh-1dhsdm.html
date: '2026-02-02 22:22:33+08:00'
lastmod: '2026-02-03 00:45:25+08:00'
toc: true
isCJKLanguage: true
---



# Zotero PDF2ZH 插件一键配置与启动脚本使用指南

## 插件主页

[GitHub - guaguastandup/zotero-pdf2zh: PDF2zh for Zotero | Zotero PDF中文翻译插件](https://github.com/guaguastandup/zotero-pdf2zh)

‍

windows 直接运行一键脚本

如果没有wget，提前下载wget放在脚本所在目录

[GNU Wget 1.21.4 for Windows](https://eternallybored.org/misc/wget/)

最终的目录会像这样：

![image](https://s2.loli.net/2026/02/03/z2PhVsaU5Cq9YZH.png)

## 配置步骤

### 创建文本文件

保存脚本，新建文本文件，粘贴下面的代码，或者直接保存[stream-l.github.io/pdf2zh一键运行脚本.txt](https://stream-l.github.io/pdf2zh%E4%B8%80%E9%94%AE%E8%BF%90%E8%A1%8C%E8%84%9A%E6%9C%AC.txt)

因为直接下脚本文件可能会被报病毒，所以咱先用文本格式保存

```latex
@echo off
title Zotero PDF2ZH 一键启动工具
color 0a
:: 适配Windows CMD默认编码，解决中文乱码
chcp 936 > nul 2>&1
setlocal enabledelayedexpansion

:: 定义核心配置（新增 Gitee 下载源）
set "PROJ_NAME=zotero-pdf2zh"
set "GITHUB_ZIP_URL=https://github.com/guaguastandup/zotero-pdf2zh/archive/refs/heads/main.zip"
set "GITEE_ZIP_URL=https://gitee.com/guaguastandup/zotero-pdf2zh/raw/main/server.zip"
set "GITHUB_ZIP_FILE=%PROJ_NAME%-main.zip"
set "GITEE_ZIP_FILE=server.zip"
set "CONDA_ENV_NAME=zotero_pdf2zh_env"
set "UV_VENV_NAME=.venv"
set "LAUNCH_FILE=server.py"
set "WGET_EXE=wget.exe"
set "UNZIP_TOOL=tar.exe"
:: 定义项目核心目录（兼容双下载源的目录结构）
set "PROJDIR=%~dp0%PROJ_NAME%"
set "SERVERDIR=%PROJDIR%\server"

echo =====================================================
echo     Zotero PDF2ZH 插件 —— 自动配置与启动脚本
echo =====================================================
echo.
echo 本脚本将自动完成以下操作：
echo   1) 检查当前目录的 Wget 工具（需手动提前放置）
echo   2) 检查 Conda 或 uv 工具（二选一即可）
echo   3) 优先从 GitHub 下载，失败自动切换 Gitee（更快）
echo   4) 对应工具创建/激活环境，安装依赖
echo   5) 按工具类型调用对应命令启动服务
echo.
pause

:: ——— 步骤 1：检查当前目录的 Wget 工具（仅使用本地已放置的） ———
echo [1/7] 检查当前目录的 Wget 工具...
set "WGET_AVAILABLE=0"
set "WGET_PATH=%~dp0%WGET_EXE%"

:: 优先检查当前目录，再检查系统环境
if exist "%WGET_PATH%" (
    echo  检测到当前目录存在 Wget 工具
    set "WGET_AVAILABLE=1"
) else (
    where %WGET_EXE% >nul 2>&1
    if %errorlevel% equ 0 (
        echo  检测到系统已安装 Wget 工具
        set "WGET_AVAILABLE=1"
        set "WGET_PATH=%WGET_EXE%"
    ) else (
        echo  错误：未在当前目录找到 %WGET_EXE%，也未检测到系统安装的 Wget！
        echo  请将 %WGET_EXE% 手动下载后放置在本脚本同一目录下，再重新运行。
        pause
        exit /b
    )
)

echo  Wget 工具验证通过，可正常使用
echo.

:: ——— 步骤 2：检查 Conda 和 uv，确定可用工具（二选一） ———
echo [2/7] 正在检查可用工具（Conda/uv 二选一）...
set "USE_CONDA=0"
set "USE_UV=0"
set "AVAILABLE_TOOL="

:: 检查 Conda（优先使用）
where conda >nul 2>&1
if %errorlevel% equ 0 (
    echo  检测到 Conda 工具
    set "USE_CONDA=1"
    set "AVAILABLE_TOOL=conda"
)

:: 检查 uv（无 Conda 则自动安装）
where uv >nul 2>&1
if %errorlevel% equ 0 (
    echo  检测到 uv 工具
    set "USE_UV=1"
    if not defined AVAILABLE_TOOL (
        set "AVAILABLE_TOOL=uv"
    )
) else (
    if %USE_CONDA% equ 0 (
        echo  未检测到任何工具，正在自动安装 uv...
        echo  安装来源：https://astral.sh/uv
        powershell -Command "irm https://astral.sh/uv/install.ps1 | pwsh" >nul 2>&1
        if %errorlevel% neq 0 (
            echo  错误：uv 安装失败！请手动安装后重试（文档：https://github.com/astral-sh/uv）
            pause
            exit /b
        )
        echo  uv 安装成功，刷新环境变量中...
        refreshenv >nul 2>&1
        set "USE_UV=1"
        set "AVAILABLE_TOOL=uv"
    )
)
echo  确定可用工具：%AVAILABLE_TOOL%
echo.

:: ——— 步骤 3：双下载源下载项目（GitHub 优先，失败切换 Gitee） ———
echo [3/7] 下载项目文件（优先 GitHub，失败切换 Gitee）...
set "DOWNLOAD_SUCCESS=0"

:: 先清理旧文件/目录，避免冲突
if exist "%GITHUB_ZIP_FILE%" del /f /q "%GITHUB_ZIP_FILE%" >nul 2>&1
if exist "%GITEE_ZIP_FILE%" del /f /q "%GITEE_ZIP_FILE%" >nul 2>&1
if exist "%PROJDIR%" rd /s /q "%PROJDIR%" >nul 2>&1
if exist "%~dp0server" rd /s /q "%~dp0server" >nul 2>&1

:: 第一步：尝试从 GitHub 下载（5 秒超时，无响应直接切换）
echo  正在从 GitHub 下载项目压缩包（5 秒超时）...
:: --timeout=5：设置连接超时 5 秒，--tries=1：仅尝试 1 次，不重试
"%WGET_PATH%" "%GITHUB_ZIP_URL%" -O "%GITHUB_ZIP_FILE%" -q --no-check-certificate --timeout=5 --tries=1
if %errorlevel% equ 0 and exist "%GITHUB_ZIP_FILE%" (
    echo  GitHub 下载成功，正在解压...
    :: 解压 GitHub 压缩包
    %UNZIP_TOOL% -xf "%GITHUB_ZIP_FILE%" -C "%~dp0" >nul 2>&1
    if %errorlevel% equ 0 (
        :: 重命名解压目录，统一项目结构
        ren "%~dp0%PROJ_NAME%-main" "%PROJ_NAME%" >nul 2>&1
        if %errorlevel% equ 0 (
            set "DOWNLOAD_SUCCESS=1"
        )
    )
    :: 清理 GitHub 临时压缩包
    del /f /q "%GITHUB_ZIP_FILE%" >nul 2>&1
)

:: 第二步：GitHub 超时/失败，切换到 Gitee 下载（直接获取 server.zip）
if %DOWNLOAD_SUCCESS% equ 0 (
    echo  GitHub 下载超时/失败，切换到 Gitee 下载...
    "%WGET_PATH%" "%GITEE_ZIP_URL%" -O "%GITEE_ZIP_FILE%" -q --no-check-certificate
    if %errorlevel% equ 0 and exist "%GITEE_ZIP_FILE%" (
        echo  Gitee 下载成功，正在解压...
        :: 解压 server.zip 到项目目录（保持统一结构）
        md "%PROJDIR%" >nul 2>&1
        %UNZIP_TOOL% -xf "%GITEE_ZIP_FILE%" -C "%PROJDIR%" >nul 2>&1
        if %errorlevel% equ 0 (
            set "DOWNLOAD_SUCCESS=1"
        )
        :: 清理 Gitee 临时压缩包
        del /f /q "%GITEE_ZIP_FILE%" >nul 2>&1
    )
)

:: 验证下载解压结果
if %DOWNLOAD_SUCCESS% equ 0 (
    echo  错误：GitHub 和 Gitee 均下载失败！请检查网络或手动下载 server.zip 放置在脚本目录。
    echo  Gitee 手动下载地址：%GITEE_ZIP_URL%
    pause
    exit /b
)

echo  项目下载并解压完成，目录结构验证通过
echo.

:: ——— 步骤 4：进入 server 子目录 ———
echo [4/7] 切换至 server 工作目录...
cd /d "%SERVERDIR%" || (
    echo  错误：无法切换至 server 目录
    pause
    exit /b
)
echo  已切换至：%CD%
echo.

:: ——— 步骤 5：对应工具创建/激活环境 + 安装依赖 ———
echo [5/7] 配置环境并安装依赖（使用 %AVAILABLE_TOOL%）...

:: 分支 1：使用 Conda 环境
if %USE_CONDA% equ 1 (
    :: 检查 Conda 环境是否存在
    call conda info --envs | findstr /R /C:"^%CONDA_ENV_NAME%$" >nul 2>&1
    if %errorlevel% neq 0 (
        echo  未检测到 Conda 环境 %CONDA_ENV_NAME%，正在创建（Python 3.10）...
        call conda create -y -n %CONDA_ENV_NAME% python=3.10 >nul 2>&1
        if %errorlevel% neq 0 (
            echo  错误：Conda 环境创建失败
            pause
            exit /b
        )
        echo  Conda 环境创建成功
    ) else (
        echo  Conda 环境 %CONDA_ENV_NAME% 已存在
    )
    :: 激活 Conda 环境
    echo  激活 Conda 环境...
    call conda activate %CONDA_ENV_NAME%
    if %errorlevel% neq 0 (
        echo  错误：Conda 环境激活失败，请关闭窗口重新运行
        pause
        exit /b
    )
    :: 安装依赖（清华镜像）
    if exist "requirements.txt" (
        echo  安装项目依赖（清华镜像加速）...
        pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade pip >nul 2>&1
        echo  Conda 环境依赖安装完成
    ) else (
        echo  警告：未找到 requirements.txt，跳过依赖安装
    )
)

:: 分支 2：使用 uv 环境（无 Conda 时）
if %USE_UV% equ 1 (
    :: 检查 uv 虚拟环境是否存在
    if not exist "%UV_VENV_NAME%" (
        echo  未检测到 uv 虚拟环境，正在创建...
        uv venv >nul 2>&1
        if %errorlevel% neq 0 (
            echo  错误：uv 虚拟环境创建失败
            pause
            exit /b
        )
        echo  uv 虚拟环境创建成功
    ) else (
        echo  uv 虚拟环境已存在
    )
    :: 激活 uv 环境
    echo  激活 uv 虚拟环境...
    call "%UV_VENV_NAME%\Scripts\activate.bat"
    if %errorlevel% neq 0 (
        echo  错误：uv 环境激活失败
        pause
        exit /b
    )
    :: 安装依赖（清华镜像）
    if exist "requirements.txt" (
        echo  安装项目依赖（uv 高速安装）...
        uv pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple >nul 2>&1
        echo  uv 环境依赖安装完成
    ) else (
        echo  警告：未找到 requirements.txt，跳过依赖安装
    )
)
echo.

:: ——— 步骤 6：按工具类型启动服务 ———
echo [6/7] 启动 Zotero PDF2ZH 服务...
timeout /t 2 >nul

if %USE_CONDA% equ 1 (
    python %LAUNCH_FILE% --env_tool=conda
) else (
    python %LAUNCH_FILE% --env_tool=uv
)

:: 启动异常判断
if %errorlevel% neq 0 (
    echo  错误：服务启动失败！
    echo  手动启动命令参考：
    if %USE_CONDA% equ 1 (
        echo  1. 激活环境：conda activate %CONDA_ENV_NAME%
        echo  2. 运行服务：python %LAUNCH_FILE% --env_tool=conda
    ) else (
        echo  1. 激活环境：call %UV_VENV_NAME%\Scripts\activate.bat
        echo  2. 运行服务：python %LAUNCH_FILE% --env_tool=uv
    )
    pause
    exit /b
)

:: ——— 步骤 7：运行成功提示 ———
echo.
echo =====================================================
echo  服务已成功启动！（使用工具：%AVAILABLE_TOOL%，下载源：%DOWNLOAD_SOURCE%）
echo  注意：请保持此窗口打开，供 Zotero 插件连接使用
echo  停止服务：按 Ctrl+C 或直接关闭此窗口
echo =====================================================
pause >nul
endlocal
```

### 文本改脚本

效果如下图，粘贴好后另存为，修改后缀，编码为ANSI  
​![image](https://s2.loli.net/2026/02/02/LSkXCBwEyFfVejA.png)

![image](https://s2.loli.net/2026/02/02/c4jOKEbiauJShwM.png)

### 链接到Zotero

如果你想把文件和zotero的东西放一块，可以直接拖到zotero中，如果你的zotero有附件管理工具，就会把脚本移动到zotero的目录里

如果你不想放在zotero的目录中，可以只在zotero中添加一个快捷方式 <kbd>添加文件链接</kbd> 选择刚才创建的bat文件

![image](https://s2.loli.net/2026/02/02/jLIuVCpMH1QhBqi.png)

多设备的话甚至可以创建一个条目然后把不同设备的运行脚本都创建链接

![image](https://s2.loli.net/2026/02/02/1j8Q4Itha3JsUkl.png)

![image](https://s2.loli.net/2026/02/03/VwPIO2ouvNAQCGS.png)

### 运行脚本

这时右键条目>打开文件目录 可以打开所在位置

![image](https://s2.loli.net/2026/02/03/9KzVUECTwsjtQmi.png)

然后双击运行（如果移动了脚本位置记得wget也要移过去，没有的话下载：[GNU Wget 1.21.4 for Windows](https://eternallybored.org/misc/wget/)）

脚本成功运行：![image](https://s2.loli.net/2026/02/03/cvgQnrJPMek5Rj2.png)

虚拟环境和服务器启动成功：

![image](https://s2.loli.net/2026/02/03/Av8eCOtlnEZ7gKo.png)

在zotero中对英文条目右键使用pdf2zh翻译之后：

![image](https://s2.loli.net/2026/02/02/r8FGes725oKYuhV.png)

## 最终效果

![image](https://s2.loli.net/2026/02/03/ObwKokDNfyiCzsF.png)

‍

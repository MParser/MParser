### 搭建MParserOS(Centos7x64)

```shell
cd /etc/yum.repos.d/
mkdir /etc/yum.repos.d/bak
mv ./*.repo ./bak

curl -O https://mirrors.aliyun.com/repo/Centos-7.repo
mv ./Centos-7.repo ./CentOS-Base.repo
curl https://mirrors.aliyun.com/repo/epel-7.repo
mv ./epel-7.repo ./epel.repo

#查看所有可用的仓库
yum repolist all
# 清除yum缓存
yum clean all
# 重新生成yum缓存
yum makecache
# 检查可用更新
yum check-update
# 执行全部更新
yum -y update

yum -y install wget vim

# 更新内核

cd ~
mkdir kernel
cd kernel

wget https://mirrors.coreix.net/elrepo-archive-archive/kernel/el7/x86_64/RPMS/kernel-lt-5.4.278-1.el7.elrepo.x86_64.rpm
wget https://mirrors.coreix.net/elrepo-archive-archive/kernel/el7/x86_64/RPMS/kernel-lt-devel-5.4.278-1.el7.elrepo.x86_64.rpm
wget https://mirrors.coreix.net/elrepo-archive-archive/kernel/el7/x86_64/RPMS/kernel-lt-headers-5.4.278-1.el7.elrepo.x86_64.rpm

rpm -ivh kernel-lt-*.rpm

# 查看当前内核启动顺序, 
# 列出所有可用的内核，
# 新安装的内核通常在最前面（索引为 0）。
grep ^menuentry /etc/grub2.cfg | cut -f 2 -d \'


# 修改 GRUB_DEFAULT=0
vim /etc/default/grub



# 生成新的 GRUB 配置：
grub2-mkconfig -o /boot/grub2/grub.cfg

# 重启
reboot


uname -r # 验证内核版本


# 安装1plane
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sh quick_start.sh

# 安装lib
yum install libseccomp-devel.x86_64 -y

# 安装go
rpm --import https://mirror.go-repo.io/centos/RPM-GPG-KEY-GO-REPO
curl -s https://mirror.go-repo.io/centos/go-repo.repo | tee /etc/yum.repos.d/go-repo.repo
yum install golang

# 安装python3.13

# 下载 OpenSSL 1.1.1w
wget https://www.openssl.org/source/openssl-1.1.1w.tar.gz
tar -zxvf openssl-1.1.1w.tar.gz
cd openssl-1.1.1w

# 配置编译选项（安装到 /usr/local/openssl-1.1.1w）
./config --prefix=/usr/local/openssl-1.1.1w --openssldir=/usr/local/openssl-1.1.1w shared zlib
make -j$(nproc)
make install


# 创建软链接指向新库
ln -s /usr/local/openssl-1.1.1w/lib64/libssl.so.1.1 /usr/lib64/libssl.so.1.1
ln -s /usr/local/openssl-1.1.1w/lib64/libcrypto.so.1.1 /usr/lib64/libcrypto.so.1.1

# 更新动态链接库配置
echo "/usr/local/openssl-1.1.1w/lib64" > /etc/ld.so.conf.d/openssl-1.1.1w.conf
ldconfig -v

/usr/local/openssl-1.1.1w/bin/openssl version # 验证版本


# 下载 Python 3.13 源码
wget https://www.python.org/ftp/python/3.13.0/Python-3.13.0.tgz
tar -zxvf Python-3.13.0.tgz
cd Python-3.13.0

# 配置编译选项，指定 OpenSSL 路径
./configure \
    --with-openssl=/usr/local/openssl-1.1.1w \
    --enable-optimizations \
    --with-ensurepip=install \
    --prefix=/usr/local/python3.13

make
make altinstall

/usr/local/python3.13/bin/python3.13 -c "import ssl; print(ssl.OPENSSL_VERSION)" # 验证 Python SSL 模块
# 创建新链接指向 Python 3.13
ln -s /usr/local/bin/python3.13 /usr/bin/python3

# 验证python3.13
python3 -V
python3 -m venv venv
source venv/bin/activate  # 激活虚拟环境
pip --version             # 应显示 pip 版本（如 23.3.1）
pip list                  # 查看已安装的包

```



### MParserOS(Rocky Linux 9)

```bash
#更新系统
dnf update -y
dnf groupinstall -y "Development Tools"
dnf install -y openssl-devel bzip2-devel libffi-devel zlib-devel

#########python3.13#################
# 下载 Python 3.13 源码
wget https://www.python.org/ftp/python/3.13.0/Python-3.13.0.tgz
tar -zxvf Python-3.13.0.tgz
cd Python-3.13.0

# 配置编译选项
./configure --prefix=/usr/local/python3.13 --enable-optimizations --with-ensurepip=install

make -j2 && sudo make install

# 4. 设置 Python313 命令
sudo ln -sf /usr/local/python3.13/bin/python3.13 /usr/bin/python313

# 验证python3.13
python313 -V
python313 -m venv venv
source venv/bin/activate  # 激活虚拟环境
pip --version             # 应显示 pip 版本（如 23.3.1）
pip list                  # 查看已安装的包


########## golang ##############
wget https://go.dev/dl/go1.24.3.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.24.3.linux-amd64.tar.gz
# 3. 配置环境变量
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
# 4. 验证
go version

########### rust ###############
# 1. 使用官方脚本安装
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# 2. 配置环境变量
source $HOME/.cargo/env

# 3. 验证
rustc --version   
cargo --version 

# 4. 配置国内镜像加速
mkdir -p ~/.cargo
cat > ~/.cargo/config << EOF
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "https://mirrors.ustc.edu.cn/crates.io-index"
EOF

########### C++ ###############
# 1. 启用 EPEL 仓库
dnf install -y epel-release
dnf config-manager --set-enabled crb

# 2. 安装 GCC 13
dnf install -y gcc-toolset-13-gcc-c++

# 3. 激活 GCC 13
scl enable gcc-toolset-13 bash

# 4. 验证
g++ --version 

echo 'source /opt/rh/gcc-toolset-13/enable' >> /etc/profile
source /etc/profile

########### Nodejs(nvm) ###############
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# 手动配置环境变量（避免因 bash 版本导致的问题）
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc

# 激活 NVM
source ~/.bashrc

# 检查版本
nvm --version

# 查看可用的 Node.js 版本
nvm list-remote
# 安装最新 LTS 版本
nvm install --lts
node -v 
npm -v
npm install -g yarn

# 使用 npm 自身更新
npm install -g npm@latest

########### 1Plane ###############

# 备份并编辑系统信息文件
cp /etc/os-release /etc/os-release.bak

# 编辑发行版名称（将 "Rocky" 改为 "CentOS"）
sed -i 's/^NAME="Rocky Linux"/NAME="CentOS"/g' /etc/os-release
sed -i 's/^ID="rocky"/ID="centos"/g' /etc/os-release
# 验证修改
cat /etc/os-release | grep -E 'NAME|ID'
# 应显示 NAME="CentOS" 和 ID="centos"

curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && sh quick_start.sh

# 还原系统信息
mv /etc/os-release.bak /etc/os-release


```


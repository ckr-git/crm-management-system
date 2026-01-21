#!/bin/bash

###############################################################################
# CRM系统数据库备份脚本
# 功能: 自动备份MySQL数据库，保留最近30天的备份
# 使用: ./backup-database.sh
# Crontab: 0 2 * * * /path/to/backup-database.sh
###############################################################################

# 加载环境变量
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '#' | awk '/=/ {print $1}')
fi

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3307}"
DB_NAME="${DB_NAME:-crm_system}"
DB_USER="${DB_USER:-crm_user}"
DB_PASSWORD="${DB_PASSWORD:-crm123456}"

# 备份目录
BACKUP_DIR="${BACKUP_DIR:-/var/backups/crm-system/mysql}"
BACKUP_RETENTION_DAYS=30

# 日志
LOG_FILE="$BACKUP_DIR/backup.log"

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 开始备份
log "==================== 开始备份 ===================="

# 生成备份文件名
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/crm_backup_$TIMESTAMP.sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

# 执行备份
log "备份数据库: $DB_NAME"
mysqldump \
    -h "$DB_HOST" \
    -P "$DB_PORT" \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --opt \
    "$DB_NAME" > "$BACKUP_FILE" 2>&1

# 检查备份是否成功
if [ $? -eq 0 ]; then
    log "✅ 数据库备份成功: $BACKUP_FILE"
    
    # 压缩备份文件
    log "压缩备份文件..."
    gzip "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        log "✅ 压缩完成: $BACKUP_FILE_GZ"
        
        # 计算文件大小
        SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
        log "备份文件大小: $SIZE"
    else
        log "❌ 压缩失败"
        exit 1
    fi
else
    log "❌ 数据库备份失败"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# 清理旧备份
log "清理超过 $BACKUP_RETENTION_DAYS 天的旧备份..."
find "$BACKUP_DIR" -name "crm_backup_*.sql.gz" -type f -mtime +$BACKUP_RETENTION_DAYS -delete

REMAINING=$(find "$BACKUP_DIR" -name "crm_backup_*.sql.gz" -type f | wc -l)
log "当前保留备份数量: $REMAINING"

# 备份到远程服务器(可选)
if [ ! -z "$REMOTE_BACKUP_SERVER" ]; then
    log "同步备份到远程服务器: $REMOTE_BACKUP_SERVER"
    rsync -avz "$BACKUP_FILE_GZ" "$REMOTE_BACKUP_SERVER:/backups/crm-system/"
    
    if [ $? -eq 0 ]; then
        log "✅ 远程备份同步成功"
    else
        log "⚠️  远程备份同步失败"
    fi
fi

log "==================== 备份完成 ===================="

# 发送通知(可选)
# 可以通过webhook、email等方式发送备份完成通知
# curl -X POST "https://your-webhook-url" -d "Backup completed: $BACKUP_FILE_GZ"

exit 0

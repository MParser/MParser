INSERT INTO MParser.LTE_MRO_RES
(
    TaskID, StartTime, EndTime, MR_LteScENBID, MR_LteScEarfcn, MR_LteScPci, MR_LteScSPCount, MR_LteScRSRPAvg, MR_LteNcEarfcn,
    MR_LteNcPci, MR_LteNcSPCount, MR_LteNcRSRPAvg, MR_LteCC6Count, MR_LteMOD3Count, MR_LteScCGI, MR_LteScLon,
    MR_LteScLat, MR_LteNcENBID, MR_LteNcCGI, MR_LteNcLon, MR_LteNcLat, minDistance
)
SELECT
    'T-1' AS TaskID,
     -- 原本的所有字段
     b.StartTime,
     b.EndTime,
     b.MR_LteScENBID,
     b.MR_LteScEarfcn,
     b.MR_LteScPci,
     -- 使用服务小区维度聚合的采样次数
     sc.MR_LteScSPCount,
     b.MR_LteScRSRPAvg,
     b.MR_LteNcEarfcn,
     b.MR_LteNcPci,
     b.MR_LteNcSPCount,
     b.MR_LteNcRSRPAvg,
     b.MR_LteCC6Count,
     b.MR_LteMOD3Count,
     b.MR_LteScCGI,
     b.MR_LteScLon,
     b.MR_LteScLat,
     -- 距离最小时选出的邻区ENB
     argMin(c.eNodeBID, greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude)) AS MR_LteNcENBID,
     -- 距离最小时选出的邻区CGI
     argMin(c.CGI, greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude)) AS MR_LteNcCGI,
     -- 距离最小时选出的邻区经度
     argMin(c.Longitude, greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude)) AS MR_LteNcLon,
     -- 距离最小时选出的邻区纬度
     argMin(c.Latitude, greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude))  AS MR_LteNcLat,
     -- 距离最小时选出的距离本身
     argMin(greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude),
            greatCircleDistance(b.MR_LteScLon, b.MR_LteScLat, c.Longitude, c.Latitude)) AS minDistance
FROM
 (
     SELECT
         min(DataTime) as StartTime,
         max(DataTime) as EndTime,
         m.MR_LteScENBID,
         m.MR_LteScEarfcn,
         m.MR_LteScPci,
         -- 邻区维度保持原样的采样次数计算
         sum(m.MR_LteScSPCount) AS MR_LteScSPCount_Old, -- 这个字段不会被使用
         round(avg(m.MR_LteScRSRPAvg) - 140, 2) AS MR_LteScRSRPAvg,
         m.MR_LteNcEarfcn,
         m.MR_LteNcPci,
         sum(m.MR_LteNcSPCount) AS MR_LteNcSPCount,
         round(avg(m.MR_LteNcRSRPAvg) - 140, 2) AS MR_LteNcRSRPAvg,
         sum(m.MR_LteCC6Count) AS MR_LteCC6Count,
         sum(m.MR_LteMOD3Count) AS MR_LteMOD3Count,
         dictGet('MParser.CellDataDict','CGI',
                 tuple(m.MR_LteScENBID, m.MR_LteScEarfcn, m.MR_LteScPci)) AS MR_LteScCGI,
         dictGet('MParser.CellDataDict','Longitude',
                 tuple(m.MR_LteScENBID, m.MR_LteScEarfcn, m.MR_LteScPci)) AS MR_LteScLon,
         dictGet('MParser.CellDataDict','Latitude',
                 tuple(m.MR_LteScENBID, m.MR_LteScEarfcn, m.MR_LteScPci)) AS MR_LteScLat
     FROM MParser.LTE_MRO AS m
     WHERE
         m.DataTime BETWEEN toDateTime('2025-01-12 00:00:00') AND toDateTime('2025-01-15 00:00:00')
     GROUP BY
         m.MR_LteScENBID, m.MR_LteScEarfcn, m.MR_LteScPci,
         m.MR_LteNcEarfcn, m.MR_LteNcPci
 ) AS b
 -- 将按服务小区分组的子查询结果连接进来
 JOIN 
 (
     SELECT
         m.MR_LteScENBID,
         m.MR_LteScEarfcn,
         m.MR_LteScPci,
         sum(m.MR_LteScSPCount) AS MR_LteScSPCount
     FROM MParser.LTE_MRO AS m
     WHERE
         m.DataTime BETWEEN toDateTime('2025-01-12 00:00:00') AND toDateTime('2025-01-15 00:00:00')
     GROUP BY
         m.MR_LteScENBID, m.MR_LteScEarfcn, m.MR_LteScPci
 ) AS sc ON b.MR_LteScENBID = sc.MR_LteScENBID 
        AND b.MR_LteScEarfcn = sc.MR_LteScEarfcn 
        AND b.MR_LteScPci = sc.MR_LteScPci
 LEFT JOIN MParser.CellDataDict AS c
 ON c.Earfcn = b.MR_LteNcEarfcn AND c.PCI = b.MR_LteNcPci
GROUP BY
    b.StartTime,
    b.EndTime,
    b.MR_LteScENBID,
    b.MR_LteScEarfcn,
    b.MR_LteScPci,
    sc.MR_LteScSPCount,  -- 使用服务小区维度的采样次数
    b.MR_LteScRSRPAvg,
    b.MR_LteNcEarfcn,
    b.MR_LteNcPci,
    b.MR_LteNcSPCount,
    b.MR_LteNcRSRPAvg,
    b.MR_LteCC6Count,
    b.MR_LteMOD3Count,
    b.MR_LteScCGI,
    b.MR_LteScLon,
    b.MR_LteScLat
;
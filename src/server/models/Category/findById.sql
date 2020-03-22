WITH RECURSIVE parent_tags AS (
  WITH base_tags AS (
    SELECT
      t.tag,
      ct.tag_id,
      c.parent_id,
      c.category_id
    FROM
      category_tags ct
      INNER JOIN categories c ON ct.category_id = c.category_id
      INNER JOIN tags t ON ct.tag_id = t.tag_id
)
  SELECT
    bt.tag,
    bt.tag_id,
    bt.parent_id,
    FALSE AS is_inherited
  FROM
    base_tags bt
  WHERE
    bt.category_id = $1
  UNION
  SELECT
    bt.tag,
    bt.tag_id,
    bt.parent_id,
    TRUE AS is_inherited
  FROM
    parent_tags pt
    INNER JOIN base_tags bt ON pt.parent_id = bt.category_id
),
json_tags AS (
  SELECT
    array_agg(row_to_json(x)) AS tags
  FROM (
    SELECT
      tag_id "tagId",
      tag,
      is_inherited "isInherited"
    FROM
      parent_tags
    ORDER BY
      tag_id) x
)
SELECT
  c.category_id "categoryId",
  c.name,
  coalesce(jt.tags, ARRAY[]::json[]) tags,
  c.parent_id "parentId"
FROM
  categories c,
  json_tags jt
WHERE
  c.category_id = $1
LIMIT 1

WITH RECURSIVE category_crumbs AS (
  SELECT
    c.category_id,
    c.parent_id,
    ARRAY[c.category_id] crumbs
  FROM
    categories c
  WHERE
    c.category_id = $1
    OR (
      SELECT
        nullif ($1::text,
          '(none)') IS NULL
        AND c.parent_id IS NULL)
    UNION
    SELECT
      c.category_id,
      c.parent_id,
      array_append(cc.crumbs, c.category_id) crumbs
    FROM
      categories c,
      category_crumbs cc
    WHERE
      cc.category_id = c.parent_id
),
json_tags AS (
  SELECT
    x. "tagId",
    row_to_json(x) tags
  FROM (
    SELECT
      t.tag_id "tagId",
      t.tag
    FROM
      tags t
    ORDER BY
      "tagId") x
),
array_tags AS (
  SELECT
    ct.category_id,
    array_agg(jt.tags) tags
  FROM
    category_tags ct
    INNER JOIN json_tags jt ON ct.tag_id = jt. "tagId"
  GROUP BY
    ct.category_id
)
SELECT
  c.category_id "categoryId",
  c.parent_id "parentId",
  c.name,
  cc.crumbs,
  coalesce(at.tags, ARRAY[]::json[]) tags
FROM
  category_crumbs cc
  INNER JOIN categories c ON cc.category_id = c.category_id
  LEFT JOIN array_tags at ON c.category_id = at.category_id

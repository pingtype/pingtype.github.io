CREATE VIEW CourseSelfStencils AS
  SELECT DISTINCT
    course_id, stencil_id
  FROM 
    Units,
    UnitMembers
  WHERE
    Units.id = UnitMembers.unit_id
  ORDER BY
    course_id, stencil_id;

CREATE OR REPLACE VIEW CourseMetrics AS
  SELECT
    Users.id as user_id, Courses.course_id,
    (SELECT COUNT(*)
      FROM Study
      WHERE
        Study.course_id = Courses.course_id AND
        Study.user_id = Users.id AND
        Study.at < now()) as review,
    (SELECT at
      FROM CourseFeaturesM CourseFeatures, Models
      WHERE
        CourseFeatures.course_id = Courses.course_id AND
        CourseFeatures.feature_id = Models.feature_id AND
        Models.user_id = Users.id AND
        Models.at > now()
      ORDER BY at ASC
      LIMIT 1) as change,
    (SELECT COUNT(*)
      FROM Study
      WHERE
        Study.course_id = Courses.course_id AND
        Study.user_id = Users.id AND
        Study.at IS NOT NULL) as seen,
    (SELECT COUNT(*)
      FROM CourseSelfStencils CourseStencils
      WHERE
        CourseStencils.course_id = Courses.course_id) as total
  FROM
    Users,
    (SELECT DISTINCT course_id FROM Units) Courses;


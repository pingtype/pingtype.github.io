DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
CREATE EXTENSION "uuid-ossp";

DROP TYPE IF EXISTS Brain CASCADE;
DROP TABLE IF EXISTS Stencils CASCADE;
DROP TABLE IF EXISTS StencilIssues CASCADE;
DROP TABLE IF EXISTS Features CASCADE;
DROP TABLE IF EXISTS StencilFeatures CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Responses CASCADE;
DROP TABLE IF EXISTS Models CASCADE;
DROP TABLE IF EXISTS Schedule CASCADE;
DROP TABLE IF EXISTS Units CASCADE;
DROP TABLE IF EXISTS UnitMembers CASCADE;
DROP TABLE IF EXISTS Inherit CASCADE;
DROP FUNCTION IF EXISTS post_stencil();
DROP VIEW IF EXISTS UserCourses CASCADE;
DROP VIEW IF EXISTS Courses CASCADE;
DROP TABLE IF EXISTS StencilLastSeen CASCADE;

\set nullDate 1/1/0001

CREATE TABLE Users
  ( id text PRIMARY KEY
  , dirty boolean NOT NULL DEFAULT true
  );

CREATE TABLE Stencils
  ( id      uuid PRIMARY KEY
  , content jsonb NOT NULL
  , dirty   boolean NOT NULL -- true => Features need to be recalculated.
  , UNIQUE (content)
  );

CREATE INDEX ON Stencils USING gin (content);

CREATE OR REPLACE VIEW StencilsView AS
  SELECT id, content
  FROM Stencils;

CREATE OR REPLACE FUNCTION post_stencil() RETURNS trigger AS
$$
DECLARE
  rec Stencils%ROWTYPE;
BEGIN
  LOOP
    SELECT id INTO rec FROM Stencils WHERE content = NEW.content;
    IF FOUND THEN
      NEW.id := rec.id;
      RETURN NEW;
    ELSE
      BEGIN
        INSERT INTO Stencils (id, content, dirty)
          VALUES (uuid_generate_v4(), NEW.content, true) RETURNING id INTO NEW.id;
        RETURN NEW;
      EXCEPTION
        WHEN unique_violation THEN
          NULL;
      END;
    END IF;
  END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER stencil_trigger
  INSTEAD OF INSERT ON StencilsView
  FOR EACH ROW
  EXECUTE PROCEDURE post_stencil();


CREATE TABLE StencilIssues
  ( stencil_id uuid REFERENCES Stencils(id)
  , created_by text REFERENCES Users(id)
  , created_at timestamptz
  , issue      text
  );

CREATE TABLE Features
  ( id      uuid PRIMARY KEY
  , content jsonb NOT NULL
  );

CREATE INDEX ON Features (content);
CREATE INDEX ON Features USING gin (content);

CREATE OR REPLACE VIEW FeaturesView AS
  SELECT id, content
  FROM Features;

CREATE OR REPLACE FUNCTION post_feature() RETURNS trigger AS
$$
DECLARE
  rec Features%ROWTYPE;
BEGIN
  LOOP
    SELECT id INTO rec FROM Features WHERE content = NEW.content;
    IF FOUND THEN
      NEW.id := rec.id;
      RETURN NEW;
    ELSE
      BEGIN
        INSERT INTO Features (id, content)
          VALUES (uuid_generate_v4(), NEW.content) RETURNING id INTO NEW.id;
        RETURN NEW;
      EXCEPTION
        WHEN unique_violation THEN
          NULL;
      END;
    END IF;
  END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER feature_trigger
  INSTEAD OF INSERT ON FeaturesView
  FOR EACH ROW
  EXECUTE PROCEDURE post_feature();







CREATE TABLE StencilFeatures
  ( stencil_id uuid REFERENCES Stencils(id)
  , feature_id uuid REFERENCES Features(id)
  , UNIQUE (stencil_id, feature_id)
  );

CREATE TABLE Responses
  ( id         uuid PRIMARY KEY DEFAULT uuid_generate_v4()
  , stencil_id uuid REFERENCES Stencils(id)
  , user_id    text REFERENCES Users(id)
  , content    jsonb NOT NULL
  , at         timestamptz NOT NULL
  ); 

CREATE INDEX ON Responses USING gin (content);

CREATE OR REPLACE VIEW StencilLastSeenGen AS
  SELECT user_id, stencil_id, max(at) as seen_at
  FROM Responses
  GROUP BY user_id, stencil_id;

CREATE TABLE StencilLastSeen
  ( user_id    text REFERENCES Users(id)
  , stencil_id uuid REFERENCES Stencils(id)
  , seen_at    timestamptz NOT NULL
  );

CREATE INDEX ON StencilLastSeen (user_id, stencil_id);

CREATE TABLE Models
  ( user_id    text REFERENCES Users(id)
  , feature_id uuid REFERENCES Features(id)
  , content    jsonb NOT NULL
  , at         timestamptz
  , created_at timestamptz
  -- , dirty      boolean NOT NULL DEFAULT true
  -- , created_at timestamptz
  , UNIQUE (user_id, feature_id)
  );

CREATE INDEX ON Models USING gin (content);

CREATE INDEX ON Models (user_id);

CREATE OR REPLACE VIEW UserStencils AS
  SELECT Users.id as user_id, Stencils.id as stencil_id
  FROM Users, Stencils;

CREATE OR REPLACE VIEW UserFeatures AS
  SELECT user_id, us.stencil_id, feature_id
  FROM UserStencils us, StencilFeatures sf
  WHERE us.stencil_id = sf.stencil_id;

CREATE TABLE Schedule
  ( user_id    text REFERENCES Users(id)
  , stencil_id uuid REFERENCES Stencils(id)
  , at         timestamptz NOT NULL
  );

create index on Schedule (user_id);
create index on Schedule (user_id, at);
create index on Schedule (user_id, stencil_id);

CREATE OR REPLACE VIEW ScheduleGen AS
  SELECT uf.user_id, stencil_id, min(coalesce(at, :'nullDate')) as at
  FROM UserFeatures uf
  LEFT JOIN Models m
  ON m.user_id = uf.user_id AND m.feature_id = uf.feature_id
  GROUP by uf.user_id, stencil_id;

CREATE OR REPLACE VIEW DirtySchedule AS
  SELECT
    ScheduleGen.user_id, ScheduleGen.stencil_id, ScheduleGen.at
  FROM
    ScheduleGen
  LEFT JOIN Schedule
  ON
    ScheduleGen.user_id = Schedule.user_id AND
    ScheduleGen.stencil_id = Schedule.stencil_id
  WHERE
    ScheduleGen.at <> :'nullDate' AND
    (ScheduleGen.at <> Schedule.at OR Schedule.at IS NULL);

-- Unit id and course id are 'text' becaue they're managed by meteor/mongo.
-- They are guaranteed to be unique.
CREATE TABLE Units
  ( id        text PRIMARY KEY
  , course_id text
  , index     int
  , UNIQUE (course_id, index)
  );

CREATE TABLE UnitMembers
  ( unit_id    text REFERENCES Units(id)
  , stencil_id uuid REFERENCES Stencils(id)
  , index      int
  );

-- Receivers inherit all of the stencils+features of their givers when
-- reviewing. Inheritance doesn't change how new material is introduced.
CREATE TABLE Inherit
  ( receiver text
  , giver text
  , UNIQUE (receiver, giver)
  );

CREATE VIEW UserCourses AS
  SELECT
    Users.id as user_id,
    Units.course_id, Units.id as unit_id, Units.index AS UnitIndex,
    UnitMembers.index AS StencilIndex, UnitMembers.stencil_id
  FROM
    Units,
    UnitMembers,
    Users
  WHERE
    Units.id = UnitMembers.unit_id;

CREATE OR REPLACE VIEW UserBrains AS
  SELECT
    Users.id as user_id, Stencils.id as stencil_id,
    ARRAY(
      SELECT to_json(row(Features.content,Models.content))
      FROM StencilFeatures, Features, Models
      WHERE
        StencilFeatures.stencil_id = Stencils.id AND
        StencilFeatures.feature_id = Features.id AND
        StencilFeatures.feature_id = Models.feature_id AND
        Models.user_id = Users.id
    ) as brain
  FROM
    Users,
    Stencils;

CREATE OR REPLACE VIEW Courses AS
  SELECT
    UserCourses.user_id,
    course_id, unit_id, UnitIndex,
    StencilIndex, UserCourses.stencil_id,
    at as at
  FROM
    UserCourses
  LEFT JOIN
    Schedule
  ON Schedule.user_id = UserCourses.user_id AND
     Schedule.stencil_id = UserCourses.stencil_id
  ORDER BY
    user_id, course_id, unitindex, stencilindex;

CREATE VIEW CourseIssues AS
  SELECT
    course_id, StencilIssues.stencil_id,
    created_by, created_at,
    issue
  FROM
    Units,
    UnitMembers,
    StencilIssues
  WHERE
    Units.id = UnitMembers.unit_id AND
    UnitMembers.stencil_id = StencilIssues.stencil_id;





CREATE OR REPLACE VIEW CourseFeatures AS
  SELECT
    -- Units.course_id as course_id, StencilFeatures.stencil_id, feature_id
    Units.course_id as course_id, feature_id
  FROM 
    Units,
    UnitMembers,
    StencilFeatures
  WHERE
    Units.id = UnitMembers.unit_id AND
    UnitMembers.stencil_id = StencilFeatures.stencil_id;

CREATE MATERIALIZED VIEW CourseFeaturesM AS
  SELECT DISTINCT * FROM CourseFeatures
  ORDER BY course_id, feature_id;

CREATE INDEX ON CourseFeaturesM (feature_id);

CREATE OR REPLACE VIEW CourseStencils AS
  SELECT DISTINCT
    Inherit.receiver as course_id, UnitMembers.stencil_id
  FROM 
    Units,
    UnitMembers,
    Inherit
  WHERE
    Inherit.giver = Units.course_id AND
    Units.id = UnitMembers.unit_id
  ORDER BY
    course_id, stencil_id;

CREATE MATERIALIZED VIEW CourseStencilsM AS
  SELECT * FROM CourseStencils;

CREATE INDEX ON CourseStencilsM ( course_id );
CREATE INDEX ON CourseStencilsM ( stencil_id );

CREATE OR REPLACE VIEW ReviewStencils AS
  SELECT DISTINCT ON (user_id, course_id, feature_id)
    Users.id as user_id, CourseFeatures.course_id,
    CourseStencils.stencil_id,
    -- cost of StencilLastSeen is 45ms. Too expensive.
    (SELECT seen_at
      FROM StencilLastSeen
      WHERE StencilLastSeen.user_id = Users.id AND
            StencilLastSeen.stencil_id = CourseStencils.stencil_id
    ) seen_at,
    CourseFeatures.feature_id,
    Models.at as review_at,
    Schedule.at as stencil_at
  FROM
    Users,
    CourseFeaturesM CourseFeatures,
    CourseStencilsM CourseStencils,
    Models,
    Schedule
  WHERE
    Users.id = Models.user_id AND
    CourseFeatures.feature_id = Models.feature_id AND
    CourseStencils.course_id = CourseFeatures.course_id AND
    Schedule.user_id = Users.id AND
    Schedule.stencil_id = CourseStencils.stencil_id AND
    Schedule.at = Models.at
  ORDER BY
    user_id, course_id, feature_id, seen_at ASC NULLS FIRST;

CREATE OR REPLACE VIEW Review AS
  SELECT
    ReviewStencils.user_id, ReviewStencils.course_id, ReviewStencils.stencil_id,
    Stencils.content as stencil,
    seen_at,
    ReviewStencils.feature_id, review_at,
    (SELECT brain FROM UserBrains
      WHERE user_id = ReviewStencils.user_id AND stencil_id = ReviewStencils.stencil_id)
      as brain
  FROM
    ReviewStencils,
    Stencils
  WHERE
    ReviewStencils.stencil_id = Stencils.id
  ORDER BY
    review_at desc;

CREATE OR REPLACE VIEW Study AS
  SELECT
    Courses.user_id,
    course_id, unit_id, UnitIndex,
    StencilIndex, Courses.stencil_id,
    Stencils.content as stencil,
    at,
    (SELECT brain FROM UserBrains
      WHERE user_id = Courses.user_id AND stencil_id = Courses.stencil_id)
      as brain
  FROM
    Courses, Stencils
  WHERE
    Courses.stencil_id = Stencils.id
  ORDER BY
    user_id, course_id, unitindex, stencilindex;


/*
Introduce new material:
Give me the list of stencils for this course up to unit X which have not
been practiced.

Review material:
Find the features for a given course, sort them by review date, limit to 10.
Find the stencils available for this course that use any of the selected
features AND have a review date no earlier than the review date for the
feature. Sort and filter the results such that only one stencil is selected
per feature and the selected stencil has the least recent seen date.

Metrics:
  Global and per course:
    How many features have review date in the past?
    How many features have review date in the future?
    How many stencils have review date in the past?
    How many stencils have review date in the future?
*/











/* Trigger to keep StencilLastSeen up-to-date. */
CREATE OR REPLACE FUNCTION upd_lastseen() RETURNS trigger AS
$$
BEGIN
  LOOP
    UPDATE StencilLastSeen
    SET seen_at = GREATEST( seen_at, NEW.at)
    WHERE stencil_id = NEW.stencil_id AND user_id = NEW.user_id;
    IF FOUND THEN
      RETURN NEW;
    ELSE
      BEGIN
        INSERT INTO StencilLastSeen (user_id, stencil_id, seen_at)
          VALUES (NEW.user_id, NEW.stencil_id, NEW.at);
        RETURN NEW;
      EXCEPTION
        WHEN unique_violation THEN
          NULL;
      END;
    END IF;
  END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER upd_lastseen_trigger
  AFTER INSERT ON Responses
  FOR EACH ROW
  EXECUTE PROCEDURE upd_lastseen();



/* Hm, this trigger isn't be run. We do delete+insert instead of update */
/* Trigger to keep Schedule reasonably up-to-date */
CREATE OR REPLACE FUNCTION upd_schedule() RETURNS trigger AS
$$
BEGIN
  UPDATE Schedule
  SET at = NEW.at
  WHERE
    user_id = NEW.user_id AND
    at = OLD.at;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER upd_schedule_trigger
  AFTER UPDATE ON Models
  FOR EACH ROW
  EXECUTE PROCEDURE upd_schedule();




CREATE OR REPLACE FUNCTION mark_dirty_user() RETURNS trigger AS
$$
BEGIN
  UPDATE Users
  SET dirty = true
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER mark_user_trigger
  AFTER INSERT ON Responses
  FOR EACH ROW
  EXECUTE PROCEDURE mark_dirty_user();











/* Metrics */
CREATE OR REPLACE VIEW CourseMetrics AS
  SELECT
    Users.id as user_id, Courses.course_id,
    (SELECT COUNT(*)
      FROM CourseFeaturesM CourseFeatures, Models
      WHERE
        CourseFeatures.course_id = Courses.course_id AND
        CourseFeatures.feature_id = Models.feature_id AND
        Models.user_id = Users.id AND
        Models.at < now()) as review,
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
      FROM CourseStencils, StencilLastSeen
      WHERE
        CourseStencils.course_id = Courses.course_id AND
        CourseStencils.stencil_id = StencilLastSeen.stencil_id AND
        StencilLastSeen.user_id = Users.id) as seen,
    (SELECT COUNT(*)
      FROM CourseStencils
      WHERE
        CourseStencils.course_id = Courses.course_id) as total
  FROM
    Users,
    (SELECT DISTINCT course_id FROM Units) Courses;


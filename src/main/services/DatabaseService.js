const fs = require('fs');
const path = require('path');

let Database;
let useSQLite = false;

try {
  Database = require('better-sqlite3');
  useSQLite = true;
} catch (error) {
  console.warn('better-sqlite3 not available, using file storage fallback');
  useSQLite = false;
}

class DatabaseService {
  constructor(appDataPath) {
    this.appDataPath = appDataPath;
    this.dbPath = path.join(appDataPath, 'matrimony.db');
    this.jsonPath = path.join(appDataPath, 'profiles.json');
    this.db = null;
    this.useSQLite = useSQLite;
  }

  init() {
    if (this.useSQLite) {
      this.initSQLite();
      // If SQLite init failed, ensure we fall back to file storage
      if (!this.db) {
        this.useSQLite = false;
        this.initFileStorage();
      }
    } else {
      this.initFileStorage();
    }
  }

  initSQLite() {
    try {
      this.db = new Database(this.dbPath);
      this.createTables();
      // Check if Height column exists, add if not
      try {
        this.db.exec('ALTER TABLE Profiles ADD COLUMN Height TEXT');
      } catch (error) {
        // Column already exists, ignore
      }
    } catch (error) {
      console.error('Error initializing SQLite:', error);
      this.useSQLite = false;
      this.db = null; // Ensure db is explicitly set to null
      // Fall back to file storage
      this.initFileStorage();
    }
  }

  createTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Profiles (
        ProfileID TEXT PRIMARY KEY,
        Name TEXT NOT NULL,
        DateOfBirth TEXT NOT NULL,
        Gender TEXT NOT NULL,
        SkinComplexion TEXT,
        Widower INTEGER DEFAULT 0,
        Divorcee INTEGER DEFAULT 0,
        Height TEXT,
        FatherName TEXT NOT NULL,
        MotherName TEXT,
        Education TEXT,
        EducationDetails TEXT,
        Occupation TEXT,
        OccupationDetails TEXT,
        Salary TEXT,
        Address TEXT,
        ContactNumber TEXT,
        Photos TEXT DEFAULT '[]',
        Horoscope TEXT DEFAULT '{}',
        IsActive INTEGER DEFAULT 1,
        DeactivationReason TEXT,
        DeactivationDate TEXT,
        MarriedThroughService INTEGER DEFAULT 0,
        CreatedAt TEXT DEFAULT (datetime('now')),
        UpdatedAt TEXT DEFAULT (datetime('now')),
        UNIQUE(Name, DateOfBirth, FatherName)
      );
    `;

    this.db.exec(createTableSQL);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_profiles_name ON Profiles(Name);
      CREATE INDEX IF NOT EXISTS idx_profiles_gender ON Profiles(Gender);
      CREATE INDEX IF NOT EXISTS idx_profiles_education ON Profiles(Education);
      CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON Profiles(CreatedAt);
      CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON Profiles(IsActive);
    `);
  }

  initFileStorage() {
    if (!fs.existsSync(this.jsonPath)) {
      fs.writeFileSync(this.jsonPath, JSON.stringify([], null, 2));
    }
  }

  generateUniqueId() {
    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare('SELECT ProfileID FROM Profiles ORDER BY ProfileID DESC LIMIT 1');
      const lastProfile = stmt.get();

      if (!lastProfile) {
        return 'SV000001';
      }

      const lastId = lastProfile.ProfileID;
      const number = parseInt(lastId.replace('SV', ''), 10);
      const nextNumber = number + 1;
      return `SV${nextNumber.toString().padStart(6, '0')}`;
    } else {
      const profiles = this.getAllProfiles();
      if (profiles.length === 0) {
        return 'SV000001';
      }

      const ids = profiles.map(p => p.ProfileID).sort();
      const lastId = ids[ids.length - 1];
      const number = parseInt(lastId.replace('SV', ''), 10);
      const nextNumber = number + 1;
      return `SV${nextNumber.toString().padStart(6, '0')}`;
    }
  }

  getAllProfiles() {
    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM Profiles ORDER BY CreatedAt DESC');
      const profiles = stmt.all();

      return profiles.map(profile => {
        return {
          ...profile,
          Photos: profile.Photos ? JSON.parse(profile.Photos) : [],
          Horoscope: profile.Horoscope ? JSON.parse(profile.Horoscope) : {},
        };
      });
    } else {
      const data = fs.readFileSync(this.jsonPath, 'utf8');
      return JSON.parse(data);
    }
  }

  getProfileById(id) {
    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare('SELECT * FROM Profiles WHERE ProfileID = ?');
      const profile = stmt.get(id);

      if (!profile) {
        throw new Error('Profile not found');
      }

      return {
        ...profile,
        Photos: profile.Photos ? JSON.parse(profile.Photos) : [],
        Horoscope: profile.Horoscope ? JSON.parse(profile.Horoscope) : {},
      };
    } else {
      const profiles = this.getAllProfiles();
      const profile = profiles.find(p => p.ProfileID === id);
      if (!profile) {
        throw new Error('Profile not found');
      }
      return profile;
    }
  }

  addProfile(profileData) {
    const profileId = this.generateUniqueId();
    const now = new Date().toISOString();

    const profile = {
      ProfileID: profileId,
      Name: profileData.Name || '',
      DateOfBirth: profileData.DateOfBirth || '',
      Gender: profileData.Gender || '',
      SkinComplexion: profileData.SkinComplexion || '',
      Widower: profileData.Widower ? 1 : 0,
      Divorcee: profileData.Divorcee ? 1 : 0,
      Height: profileData.Height && profileData.Height !== '0' && Number(profileData.Height) !== 0 ? profileData.Height : '',
      FatherName: profileData.FatherName || '',
      MotherName: profileData.MotherName || '',
      Education: profileData.Education || '',
      EducationDetails: profileData.EducationDetails || '',
      Occupation: profileData.Occupation || '',
      OccupationDetails: profileData.OccupationDetails || '',
      Salary: profileData.Salary || '',
      Address: profileData.Address || '',
      ContactNumber: profileData.ContactNumber || '',
      Photos: JSON.stringify(profileData.Photos || []),
      Horoscope: JSON.stringify(profileData.Horoscope || {}),
      IsActive: 1,
      DeactivationReason: null,
      DeactivationDate: null,
      MarriedThroughService: 0,
      CreatedAt: now,
      UpdatedAt: now,
    };

    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare(`
        INSERT INTO Profiles (
          ProfileID, Name, DateOfBirth, Gender, SkinComplexion, Widower, Divorcee,
          Height, FatherName, MotherName, Education, EducationDetails,
          Occupation, OccupationDetails, Salary, Address, ContactNumber,
          Photos, Horoscope, IsActive, DeactivationReason, DeactivationDate,
          MarriedThroughService, CreatedAt, UpdatedAt
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      try {
        stmt.run(
          profile.ProfileID, profile.Name, profile.DateOfBirth, profile.Gender,
          profile.SkinComplexion, profile.Widower, profile.Divorcee,
          profile.Height, profile.FatherName, profile.MotherName,
          profile.Education, profile.EducationDetails,
          profile.Occupation, profile.OccupationDetails, profile.Salary,
          profile.Address, profile.ContactNumber,
          profile.Photos, profile.Horoscope, profile.IsActive,
          profile.DeactivationReason, profile.DeactivationDate,
          profile.MarriedThroughService, profile.CreatedAt, profile.UpdatedAt
        );
      } catch (error) {
        if (error.message.includes('UNIQUE constraint')) {
          throw new Error('இந்த பெயர், பிறந்த தேதி மற்றும் தந்தை பெயர் உடன் ஏற்கனவே ஒரு சுயவிவரம் உள்ளது');
        }
        throw error;
      }
    } else {
      const profiles = this.getAllProfiles();
      profiles.push(profile);
      fs.writeFileSync(this.jsonPath, JSON.stringify(profiles, null, 2));
    }

    return { ProfileID: profileId, ...profile };
  }

  updateProfile(id, profileData) {
    const now = new Date().toISOString();

    const profile = {
      Name: profileData.Name || '',
      DateOfBirth: profileData.DateOfBirth || '',
      Gender: profileData.Gender || '',
      SkinComplexion: profileData.SkinComplexion || '',
      Widower: profileData.Widower ? 1 : 0,
      Divorcee: profileData.Divorcee ? 1 : 0,
      Height: profileData.Height && profileData.Height !== '0' && Number(profileData.Height) !== 0 ? profileData.Height : '',
      FatherName: profileData.FatherName || '',
      MotherName: profileData.MotherName || '',
      Education: profileData.Education || '',
      EducationDetails: profileData.EducationDetails || '',
      Occupation: profileData.Occupation || '',
      OccupationDetails: profileData.OccupationDetails || '',
      Salary: profileData.Salary || '',
      Address: profileData.Address || '',
      ContactNumber: profileData.ContactNumber || '',
      Photos: JSON.stringify(profileData.Photos || []),
      Horoscope: JSON.stringify(profileData.Horoscope || {}),
      UpdatedAt: now,
    };

    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare(`
        UPDATE Profiles SET
          Name = ?, DateOfBirth = ?, Gender = ?, SkinComplexion = ?,
          Widower = ?, Divorcee = ?, Height = ?, FatherName = ?,
          MotherName = ?, Education = ?, EducationDetails = ?,
          Occupation = ?, OccupationDetails = ?, Salary = ?,
          Address = ?, ContactNumber = ?, Photos = ?, Horoscope = ?,
          UpdatedAt = ?
        WHERE ProfileID = ?
      `);

      stmt.run(
        profile.Name, profile.DateOfBirth, profile.Gender, profile.SkinComplexion,
        profile.Widower, profile.Divorcee, profile.Height, profile.FatherName,
        profile.MotherName, profile.Education, profile.EducationDetails,
        profile.Occupation, profile.OccupationDetails, profile.Salary,
        profile.Address, profile.ContactNumber, profile.Photos, profile.Horoscope,
        profile.UpdatedAt, id
      );
    } else {
      const profiles = this.getAllProfiles();
      const index = profiles.findIndex(p => p.ProfileID === id);
      if (index === -1) {
        throw new Error('Profile not found');
      }
      profiles[index] = { ...profiles[index], ...profile, ProfileID: id };
      fs.writeFileSync(this.jsonPath, JSON.stringify(profiles, null, 2));
    }

    return this.getProfileById(id);
  }

  deleteProfile(id) {
    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare('DELETE FROM Profiles WHERE ProfileID = ?');
      const result = stmt.run(id);
      if (result.changes === 0) {
        throw new Error('Profile not found');
      }
    } else {
      const profiles = this.getAllProfiles();
      const filtered = profiles.filter(p => p.ProfileID !== id);
      if (filtered.length === profiles.length) {
        throw new Error('Profile not found');
      }
      fs.writeFileSync(this.jsonPath, JSON.stringify(filtered, null, 2));
    }
  }

  searchProfiles(criteria) {
    let profiles = this.getAllProfiles();

    if (criteria.profileId) {
      profiles = profiles.filter(p =>
        p.ProfileID.toLowerCase().includes(criteria.profileId.toLowerCase())
      );
    }

    if (criteria.name) {
      profiles = profiles.filter(p =>
        p.Name.toLowerCase().includes(criteria.name.toLowerCase())
      );
    }

    if (criteria.gender) {
      profiles = profiles.filter(p => p.Gender === criteria.gender);
    }

    if (criteria.minAge || criteria.maxAge) {
      const now = new Date();
      profiles = profiles.filter(p => {
        const birthDate = new Date(p.DateOfBirth);
        const age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate()) ? age - 1 : age;

        if (criteria.minAge && actualAge < criteria.minAge) return false;
        if (criteria.maxAge && actualAge > criteria.maxAge) return false;
        return true;
      });
    }

    if (criteria.education) {
      profiles = profiles.filter(p => p.Education === criteria.education);
    }

    if (criteria.occupation) {
      profiles = profiles.filter(p => p.Occupation === criteria.occupation);
    }

    if (criteria.minSalary || criteria.maxSalary) {
      profiles = profiles.filter(p => {
        const salary = parseFloat(p.Salary) || 0;
        if (criteria.minSalary && salary < criteria.minSalary) return false;
        if (criteria.maxSalary && salary > criteria.maxSalary) return false;
        return true;
      });
    }

    if (criteria.fatherName) {
      profiles = profiles.filter(p =>
        p.FatherName.toLowerCase().includes(criteria.fatherName.toLowerCase())
      );
    }

    if (criteria.isActive !== undefined) {
      profiles = profiles.filter(p => p.IsActive === (criteria.isActive ? 1 : 0));
    }

    return profiles;
  }

  deactivateProfile(profileId, reason, marriedThroughService) {
    const now = new Date().toISOString();

    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare(`
        UPDATE Profiles SET
          IsActive = 0,
          DeactivationReason = ?,
          DeactivationDate = ?,
          MarriedThroughService = ?
        WHERE ProfileID = ?
      `);
      stmt.run(reason || '', now, marriedThroughService ? 1 : 0, profileId);
    } else {
      const profiles = this.getAllProfiles();
      const profile = profiles.find(p => p.ProfileID === profileId);
      if (profile) {
        profile.IsActive = 0;
        profile.DeactivationReason = reason || '';
        profile.DeactivationDate = now;
        profile.MarriedThroughService = marriedThroughService ? 1 : 0;
        fs.writeFileSync(this.jsonPath, JSON.stringify(profiles, null, 2));
      }
    }
  }

  activateProfile(profileId) {
    if (this.useSQLite && this.db) {
      const stmt = this.db.prepare(`
        UPDATE Profiles SET
          IsActive = 1,
          DeactivationReason = NULL,
          DeactivationDate = NULL,
          MarriedThroughService = 0
        WHERE ProfileID = ?
      `);
      stmt.run(profileId);
    } else {
      const profiles = this.getAllProfiles();
      const profile = profiles.find(p => p.ProfileID === profileId);
      if (profile) {
        profile.IsActive = 1;
        profile.DeactivationReason = null;
        profile.DeactivationDate = null;
        profile.MarriedThroughService = 0;
        fs.writeFileSync(this.jsonPath, JSON.stringify(profiles, null, 2));
      }
    }
  }
}

module.exports = DatabaseService;




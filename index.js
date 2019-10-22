require('./logger');
const fs = require('fs'),
    dotenv = require('dotenv'),
    express = require('express'),
    cors = require('cors'),
    multer = require('multer'),
    Sequelize = require('sequelize'),
    session = require('client-sessions'),
    fileType = require('file-type'),
    upload = multer(),
    Op = Sequelize.Op,
    ms = require('ms'),
    bcrypt = require('bcrypt'),
    map = {
        'image/x-icon': 'ico',
        'text/html': 'html',
        'text/javascript': 'js',
        'application/json': 'json',
        'text/css': 'css',
        'image/png': 'png',
        'image/jpg': 'jpeg',
        'audio/wav': 'wav',
        'audio/mpeg': 'mp3',
        'image/svg+xml': 'svg',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'image/gif': 'gif',
        'application/octet-stream': 'exe',
        'text/xml': 'xml',
        'video/mp4': 'mp4',
        'application/zip': 'zip',
        'text/plain': 'txt'
    },
    port = process.argv[2] || 3000;

dotenv.config();
const sequelize = new Sequelize(`postgres://${process.env.SERVERUSERNAME}:${process.env.SERVERPASSWORD}@${process.env.SERVERIP}:5432/${process.env.SERVERDB}`, { logging: false });
class user extends Sequelize.Model { };
user.init({
    id: { type: Sequelize.STRING, primaryKey: true },
    username: Sequelize.STRING(24),
    displayName: Sequelize.STRING,
    email: Sequelize.STRING,
    staff: Sequelize.STRING,
    password: Sequelize.STRING(2000),
    apiToken: Sequelize.STRING,
    domain: Sequelize.STRING,
    subdomain: Sequelize.STRING,
    bannedAt: Sequelize.DATE
}, { sequelize });
user.sync({ force: false }).then(() => {
    console.log('Users synced to database successfully!');
}).catch(err => {
    console.error('an error occurred while performing this operation', err);
});
class uploads extends Sequelize.Model { };
uploads.init({
    filename: { type: Sequelize.STRING, primaryKey: true },
    userid: Sequelize.STRING,
    size: Sequelize.INTEGER
}, { sequelize });
uploads.sync({ force: false }).then(() => {
    console.log('Uploads synced to database successfully!');
}).catch(err => {
    console.error('an error occurred while performing this operation', err);
});
class actions extends Sequelize.Model { };
actions.init({
    type: Sequelize.INTEGER,
    by: Sequelize.STRING,
    to: Sequelize.STRING,
    addInfo: Sequelize.STRING(2000)
}, { sequelize });
actions.sync({ force: false }).then(() => {
    console.log('Actions synced to database successfully!');
}).catch(err => {
    console.error('an error occurred while performing this operation', err);
});
class domains extends Sequelize.Model {};
domains.init({
    domain: {type: Sequelize.STRING, primaryKey: true}
}, { sequelize });
domains.sync({ force: false }).then(() => {
    console.log('Domains synced to database successfully!');
}).catch(err => {
    console.error('an error occurred while performing this operation', err);
});
function newString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
const options = {
    key: fs.readFileSync('./alekeagle.com.key'),
    cert: fs.readFileSync('./alekeagle.com.pem')
}
const corsOptions = {
    origin: true,
    optionsSuccessStatus: 200
}
let https = require('https'),
    app = require('express')();
app.use(cors(corsOptions));
app.engine('html', require('mustache-express')());
app.use(express.json());
let server = https.createServer(options, app);
app.use(session({
    cookieName: 'session',
    secret: Math.random().toString(),
    duration: ms('1 day'),
    activeDuration: ms('1 hour'),
    cookie: {
        httpOnly: true,
        path: '/'
    }
}));
function authenticate(req, res) {
    return new Promise((resolve, reject) => {
        if (!req.session.user) {
            req.session.reset();
            reject();
            return;
        }else {
            user.findOne({
                where: {
                    id: req.session.user.id || 'none'
                }
            }).then(u => {
                if (u !== null) {
                    if (u.password === req.session.user.password) {
                        resolve();
                    }else {
                        req.session.reset();
                        reject();
                    }
                }else {
                    req.session.reset();
                    reject();
                }
            });
        }
    });
}
app.use((req, res, next) => {
    res.set({
        'Cache-Control': 'public, max-age=172800'
    });
    if (req.headers.host === 'alekeagle.tk') {
        res.redirect(301, 'https://alekeagle.com' + req.path);
        return;
    }
    console.log(`${req.ip}: ${req.method} => ${req.protocol}://${req.headers.host}${req.url}`);
    next();
});
app.get('/api/users/', (req, res) => {
    user.findAll().then(users => {
        res.status(200).json(users.map(u => { id, username, staff, createdAt, bannedAt }));
    }, err => {
        res.sendStatus(500);
        console.error(err);
    });
})
app.get('/api/user/', (req, res) => {
    if (!req.query.id) res.status(400).json({ error: 'You must provide a valid query string.' });
    else {
        user.findOne({
            where: {
                id: req.query.id
            }
        }).then(user => {
            if (user === undefined) res.status(404).json({ error: 'Not found' });
            else res.status(200).json({ id, username, staff, createdAt, bannedAt });
        }, err => {
            res.sendStatus(500);
            console.error(err);
        });
    }
});
app.post('/api/user/create/', (req, res) => {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.sendStatus(400);
        return;
    } else {
        let username = name.toLowerCase();
        user.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            }
        }).then(u => {
            if (u === null) {
                let now = new Date(Date.now());
                let part1 = new Buffer.from(now.getTime().toString());
                let part2 = new Buffer.from(new Date(Date.now()).toISOString());
                bcrypt.hash(password, Math.floor(Math.random() * 10)).then(hashedPass => {
                    user.create({ id: now.getTime(), username, domain: 'alekeagle.me', subdomain: '', displayName: name, email, createdAt: now, updatedAt: now, password: hashedPass, staff: '', apiToken: `${part1.toString('base64').replace(/==/g, '')}.${part2.toString('base64')}` }).then(newUser => {
                        req.session.user = newUser;
                        res.status(201).json(newUser);
                        actions.create({ type: 1, by: newUser.id, to: newUser.id }).then(() => {
                            console.log('New user created');
                        });
                    }, err => {
                        res.sendStatus(500);
                        console.error(err);
                    });
                }, err => {
                    res.sendStatus(500);
                    console.error(err);
                });
            } else {
                res.sendStatus(401);
                return;
            }
        }, err => {
            res.sendStatus(500);
            console.error(err);
        });
    }
});
app.put('/api/user/update/', (req, res) => {
    authenticate(req, res).then(() => {
        let { email, name, password, newPassword, id } = req.body;
        if (!(email || name || newPassword)) {
            res.sendStatus(400);
            return;
        } else {
            let username = name.toLowerCase();
            if (id) {
                if (req.session.user.staff === '') {
                    res.sendStatus(401);
                    return;
                } else {
                    user.findOne({
                        where: {
                            id
                        }
                    }).then(u => {
                        if (u === undefined) {
                            res.sendStatus(404);
                            return;
                        } else {
                            let now = new Date(Date.now());
                            bcrypt.hash(newPassword || password, Math.floor(Math.random() * 10)).then(hashedPass => {
                                u.update({ email: email || u.email, displayName: name || u.displayName, username: username || u.username, updatedAt: now, password: hashedPass }).then(() => {
                                    actions.create({ type: 2, by: req.session.user.id, to: id }).then(() => {
                                        console.log('User updated');
                                    });
                                    res.sendStatus(200);
                                }, err => {
                                    res.sendStatus(500);
                                    console.error(err);
                                });
                            }, err => {
                                res.sendStatus(500);
                                console.error(err);
                            });
                        }
                    }, err => {
                        res.sendStatus(500);
                        console.error(err);
                    });
                }
            } else {
                if (!password) {
                    res.sendStatus(400);
                    return;
                }
                if (req.session.user) {
                    user.findOne({
                        where: {
                            [Op.or]: [
                                { username: req.session.user.username },
                                { email: req.session.user.username }
                            ]
                        }
                    }).then(u => {
                        if (u !== null) {
                            let now = new Date(Date.now());
                            bcrypt.compare(password, u.password).then(match => {
                                if (match) {
                                    bcrypt.hash(newPassword ? newPassword : password, Math.floor(Math.random() * 10)).then(hashedPass => {
                                        u.update({ email: email || u.email, displayName: name || u.displayName, username: username || u.username, updatedAt: now, password: hashedPass }).then(updatedUser => {
                                            req.session.user = updatedUser;
                                            actions.create({ type: 2, by: updatedUser.id, to: updatedUser.id }).then(() => {
                                                console.log('User updated');
                                            });
                                            res.sendStatus(200);
                                        }, err => {
                                            res.sendStatus(500);
                                            console.error(err);
                                        });
                                    }, err => {
                                        res.sendStatus(500);
                                        console.error(err);
                                    });
                                }
                            }, err => {
                                res.sendStatus(500);
                                console.error(err);
                            });
                        }
                    }, err => {
                        res.sendStatus(500);
                        console.error(err);
                    });
                } else {
                    res.sendStatus(401);
                    return;
                }
            }
        }
    }).catch(() => {
        res.sendStatus(401);
    });
});
app.delete('/api/user/delete/', (req, res) => {
    authenticate(req, res).then(() => {
        let { password, id } = req.body;
        if (id) {
            if (req.session.user.staff === '') {
                res.sendStatus(401);
                return;
            } else {
                user.findOne({
                    where: {
                        id
                    }
                }).then(u => {
                    if (u !== null) {
                        u.destroy().then(() => {
                            actions.create({ type: 4, by: req.session.user.id, to: id }).then(() => {
                                console.log('User Deleted');
                                res.sendStatus(200);
                            });
                        });
                    }
                });
            }
        }else if (password) {
            if (!req.session.user) {
                res.sendStatus(401);
                return;
            } else {
                user.findOne({
                    where: {
                        [Op.or]: [
                            { username: req.session.user.username },
                            { email: req.session.user.username }
                        ]
                    }
                }).then(u => {
                    if (u !== null) {
                        bcrypt.compare(password, u.password).then(match => {
                            if (match) {
                                u.destroy().then(() => {
                                    actions.create({ type: 4, by: req.session.user.id, to: req.session.user.id }).then(() => {
                                        console.log('User Deleted');
                                    });
                                    req.session.reset();
                                    res.sendStatus(200);
                                }, err => {
                                    res.sendStatus(500);
                                    console.error(err);
                                });
                            } else {
                                res.sendStatus(400);
                                return;
                            }
                        }), err => {
                            res.sendStatus(500);
                            console.error(err);
                        };
                    } else {
                        req.session.reset();
                        res.sendStatus(401);
                    }
                }, err => {
                    res.sendStatus(500);
                    console.error(err);
                });
            }
        }else {
            res.sendStatus(400);
            return;
        }
    }).catch(() => {
        res.sendStatus(401);
    });
});
app.get('/api/user/logout/', (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    req.session.reset();
    res.sendStatus(200);
});
app.post('/api/user/login/', (req, res) => {
    let { name, password } = req.body;
    if (!name || !password) {
        res.sendStatus(400);
        return;
    } else {
        name = name.toLowerCase();
        user.findOne({
            where: {
                [Op.or]: [
                    { username: name },
                    { email: name }
                ]
            }
        }).then(u => {
            if (u !== null) {
                bcrypt.compare(password, u.password).then(match => {
                    if (match) {
                        actions.create({ type: 5, by: u.id, to: u.id }).then(() => {
                            console.log('User login');
                        });
                        req.session.user = u;
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(401);
                    }
                }, err => {
                    res.sendStatus(500);
                    console.error(err);
                });
            }else {
                res.sendStatus(401);
                return;
            }
        }, err => {
            res.sendStatus(500);
            console.error(err);
        });
    }
});
app.get('/api/self/', (req, res) => {
    authenticate(req, res).then(() => {
        res.status(200).json(req.session.user);
    }, () => {
        res.sendStatus(401);
    });
});
app.get('/api/authenticate/', (req, res) => {
    authenticate(req, res).then(() => {
        res.sendStatus(200);
    }, () => {
        res.sendStatus(401);
    });
});
app.post('/api/user/regentoken/', (req, res) => {
    authenticate(req, res).then(() => {
        let { password } = req.body;
        if (!req.session.user) {
            res.sendStatus(401);
            return;
        }else {
            let part1 = new Buffer.from(req.session.user.id);
            let part2 = new Buffer.from(new Date(Date.now()).toISOString());
            user.findOne({
                where: {
                    [Op.or]: [
                        { username: req.session.user.username },
                        { email: req.session.user.username }
                    ]
                }
            }).then(u => {
                if (u !== null) {
                    let now = new Date(Date.now());
                    bcrypt.compare(password, u.password).then(match => {
                        if (match) {
                            u.update({apiToken: `${part1.toString('base64').replace(/==/g, '')}.${part2.toString('base64')}`}).then(u => {
                                req.session.user = u;
                                res.status(201).json({token: `${part1.toString('base64').replace(/==/g, '')}.${part2.toString('base64')}`});
                                actions.create({ type: 3, by: u.id, to: u.id }).then(() => {
                                    console.log('API Token refreshed');
                                });
                            }, err => {
                                res.sendStatus(500);
                                console.error(err);
                            });
                        }
                    }, err => {
                        res.sendStatus(500);
                        console.error(err);
                    });
                }
            }, err => {
                res.sendStatus(500);
                console.error(err);
            });
    
        }
    }).catch(() => {
        res.sendStatus(401);
        return;
    });
});
app.get('/api/user/save/', (req, res) => {
    authenticate(req, res).then(() => {
        switch(req.query.type) {
            case 'sharex':
                res.set('Content-Disposition', 'attachment; filename="ShareX_Uploader.sxcu"');
                res.status(200).send(`{"Version": "12.4.1","Name": "AlekEagle ShareX Uploader","DestinationType": "ImageUploader, TextUploader, FileUploader","RequestMethod": "POST","RequestURL": "https://i.alekeagle.com/upload","Headers": {"Authorization": "${req.session.user.apiToken}"},"Body": "MultipartFormData","FileFormName": "file"}`);
            break;
            case 'sharenix':
                res.set('Content-Disposition', 'attachment; filename="ShareNiX_Uploader.json"');
                res.status(200).send(`{"Name": "AlekEagle ShareNiX Uploader","RequestType": "POST","Headers": {"Authorization": "${req.session.user.apiToken}"},"RequestURL": "https://i.alekeagle.com/upload","FileFormName": "file","ResponseType": "Text"}`);
            break;
            default:
                res.sendStatus(404);
            break;
        }
    }).catch(() => {
        res.sendStatus(401);
    });
});
app.get('/api/domains/', (req, res) => {
    domains.findAll().then(d => {
        res.status(200).json(d);
    });
});
app.patch('/api/user/domain/', (req, res) => {
    authenticate(req, res).then(() => {
        let { domain, subdomain } = req.body;
        subdomain = subdomain.replace(/ /g, '-');
        domains.findOne({
            where: {
                domain
            }
        }).then(d => {
            if (d !== null) {
                user.findOne({
                    where: {
                        id: req.session.user.id
                    }
                }).then(u => {
                    if (u !== null) {
                        u.update({domain, subdomain}).then(u => {
                            req.session.user = u;
                            res.sendStatus(200);
                        });
                    }
                }).catch(() => {
                    res.sendStatus(500);
                });
            }else {
                res.sendStatus(400);
            }
        }).catch(() => {
            res.sendStatus(500);
            return;
        });
    }).catch(() => {
        res.sendStatus(401);
    });
});
app.post('/upload/', upload.single('file'), (req, res) => {
    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }else {
        user.findOne({
            where: {
                apiToken: req.headers.authorization
            }
        }).then(u => {
            if (u !== null) {
                if (!req.file) {
                    if (!req.body.file) {
                        res.sendStatus(400);
                        return;
                    }
                    let filename = newString(10),
                        writeStream = fs.createWriteStream(`${__dirname}/uploads/${filename}.txt`);
                    writeStream.write(req.body.file);
                    writeStream.end();
                    res.status(201).end(`https://${u.subdomain}.${u.domain}/${filename}.txt`);
                    uploads.create({filename: `${filename}.txt`, userid: u.id, size: req.body.file.length});
                } else {
                    let ft = fileType(req.file.buffer.slice(0, fileType.minimumBytes));
                    let filename = newString(10),
                    writeStream = fs.createWriteStream(`${__dirname}/uploads/${filename}.${ft ? ft.ext : map[req.file.mimetype]}`);
                    writeStream.write(req.file.buffer);
                    writeStream.end();
                    res.status(201).end(`https://${u.subdomain}.${u.domain}/${filename}.${ft ? ft.ext : map[req.file.mimetype]}`);
                    uploads.create({filename: `${filename}.${ft ? ft.ext : map[req.file.mimetype]}`, userid: u.id, size: req.file.size});
                }
            }else {
                res.sendStatus(401);
                return;
            }
        });
    }
});
app.use(express.static('root'), express.static('uploads'));

server.listen(port);
console.log(`Server listening on port ${port}`);
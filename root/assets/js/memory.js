'use strict';

class KiloBytes {
    raw() {
        return process.memoryUsage().rss / 1024;
    }

    stringify() {
        let mem = process.memoryUsage().rss / 1024;
        return `${mem.toString().slice(0, mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}KB`;
    }
}

class MegaBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024;
    }

    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024;
        return `${mem.toString().slice(0, mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}MB`;
    }
}

class GigaBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024 / 1024;
    }

    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024 / 1024;
        return `${mem.toString().slice(0, mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}GB`;
    }
}

class TeraBytes {
    raw() {
        return process.memoryUsage().rss / 1024 / 1024 / 1024 / 1024;
    }

    stringify() {
        let mem = process.memoryUsage().rss / 1024 / 1024 / 1024 / 1024;
        return `${mem.toString().slice(0, mem.toString().indexOf('.') !== -1 ? mem.toString().indexOf('.') + 3 : mem.toString().length)}TB`;
    }
}

window.memory = (mem) => {
    if ((mem / 1024 / 1024 / 1024) > 1024) return `${(mem / 1024 / 1024 / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024 / 1024 / 1024).toString().indexOf('.') + 3)}TB`;
    else if ((mem / 1024 / 1024) > 1024) return `${(mem / 1024 / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024 / 1024).toString().indexOf('.') + 3)}GB`;
    else if ((mem / 1024) > 1024) return `${(mem / 1024 / 1024).toString().slice(0, (mem / 1024 / 1024).toString().indexOf('.') + 3)}MB`;
    else if (mem > 1024) return `${(mem / 1024).toString().slice(0, (mem / 1024).toString().indexOf('.') + 3)}KB`;
    else return `${mem}B`;
}


window.KiloBytes = KiloBytes;
window.MegaBytes = MegaBytes;
window.GigaBytes = GigaBytes;
window.TeraBytes = TeraBytes;
window.KB = window.KiloBytes;
window.MB = window.MegaBytes;
window.GB = window.GigaBytes;
window.TB = window.TeraBytes;

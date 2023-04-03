package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "github.com/go-sql-driver/mysql"
    "database/sql"
    "io/ioutil"
    "strconv"
)

type credential struct {
    Username string `json:"username"`
    Email string `json:"email"`
    Password string `json:"password"`
}

type device struct {
    Serial string `json:"serial"`
    LastFeed string `json:"lastfeed"`
    FoodLeft float32 `json:"foodleft"`
    WeightCof float32 `json:"weightcof"`
    Name string `json:"name"`
}

var db *sql.DB

func loginHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    body, err := ioutil.ReadAll(r.Body)
    defer r.Body.Close()
    if err != nil {
        http.Error(w, "Error reading request body", http.StatusInternalServerError)
        return
    }

    var login_c credential
    err = json.Unmarshal(body, &login_c)
    if err != nil {
        fmt.Fprintf(w, "Error parsing request")
        return
    }
    
    stmt, err := db.Prepare("SELECT username, email, password FROM user WHERE email = ? or username = ?")
    if err != nil {
        fmt.Println("Error in query:", err)
        return
    }
    defer stmt.Close()

    rows, err := stmt.Query(login_c.Email, login_c.Username)
    if err != nil {
        fmt.Println("Error in statement:", err)
    }
    defer rows.Close()

    auth := false
    var username string
    for rows.Next() {
        var email string
        var password string
        if err := rows.Scan(&username, &email, &password); err != nil {
            fmt.Println("Error in scan:", err)
            return
        }
       
        if (login_c.Email == email || login_c.Username == username) && login_c.Password == password {
            auth = true
            break
        }
    }
    if err := rows.Err(); err != nil {
        fmt.Println("Error in rows:", err)
        return
    }

    var response map[string]string
    if auth == true {
        response = map[string]string{"status": "ok", "username": username}
    } else {
        response = map[string]string{"status": "fail"}
    }

    jsonResponse, jsonErr := json.Marshal(response)
    if jsonErr != nil {
        http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write(jsonResponse)
}

func devicesHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    sqlQuery := "SELECT serial, food_left, last_feed, weight_cof, name FROM feeder WHERE owner = ?"

    user := r.URL.Query().Get("user")
    if user == "" {
        sqlQuery = "SELECT serial, food_left, last_feed, weight_cof, name FROM feeder"
    }

    stmt, err := db.Prepare(sqlQuery)

    if err != nil {
        fmt.Println("Error in query:", err)
        return
    }
    defer stmt.Close()


    rows, err := stmt.Query()
    if user != "" {
        rows, err = stmt.Query(user)
    }

    if err != nil {
        fmt.Println("Error in statement:", err)
    }
    defer rows.Close()

    devices := []device{}
    for rows.Next() {
        var serial string
        var foodLeft float32
        var lastFeed string
        var weightCof float32
        var name string
        if err := rows.Scan(&serial, &foodLeft, &lastFeed, &weightCof, &name); err != nil {
            fmt.Println("Error in scan:", err)
            return
        }

        d := device{Serial: serial, LastFeed: lastFeed, FoodLeft: foodLeft, WeightCof: weightCof, Name: name}
        devices = append(devices, d)
    }
    if err := rows.Err(); err != nil {
        fmt.Println("Error in rows:", err)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)

    device_serial := r.URL.Query().Get("serial")
    if device_serial != "" {
        for _, v := range devices {
            if device_serial == v.Serial {
                jsonResponse, err := json.Marshal(v)
                if err != nil {
                    http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
                    return
                }

                w.Write(jsonResponse)
            }
        }
    } else {
        jsonResponse, err := json.Marshal(devices)
        if err != nil {
            http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
            return
        }

        w.Write(jsonResponse)
    }
}

func actionHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != "PUT" {
        http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
        return
    }

    body, err := ioutil.ReadAll(r.Body)
    defer r.Body.Close()
    if err != nil {
        http.Error(w, "Error reading request body", http.StatusInternalServerError)
        return
    }

    var data map[string]interface{}
    if err := json.Unmarshal(body, &data); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    if data["serial"] == nil || data["owner"] == nil {
        fmt.Fprintf(w, "Missing serial and owner")
        return
    }

    if data["action"] == "feednow" {
        foodAmount, _ := strconv.ParseFloat(data["amount"].(string), 32)
        if foodAmount <= 0 {
            return
        }

        stmt, err := db.Prepare("UPDATE feeder SET last_feed=NOW() WHERE serial=? AND owner=?")
        if err != nil {
            fmt.Println("Error in query:", err)
            return
        }
        defer stmt.Close()

        _, err = stmt.Query(data["serial"], data["owner"])
        if err != nil {
            fmt.Println("Error in statement:", err)
            return
        }

        response := map[string]string{"status": "ok"}

        jsonResponse, jsonErr := json.Marshal(response)
        if jsonErr != nil {
            http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write(jsonResponse)

        // MQTT
    } else if data["action"] == "addsupervisor" && data["supervisor"] != nil {
    } else if data["action"] == "addweightcof" && data["weightcof"] != nil {
        stmt, err := db.Prepare("UPDATE feeder SET weight_cof=? WHERE serial=? AND owner=?")
        if err != nil {
            fmt.Println("Error in query:", err)
            return
        }
        defer stmt.Close()

        weightCof, _ := strconv.ParseFloat(data["weightcof"].(string), 32)
        _, err = stmt.Query(weightCof, data["serial"], data["owner"])
        if err != nil {
            fmt.Println("Error in statement:", err)
            return
        }

        response := map[string]string{"status": "ok"}

        jsonResponse, jsonErr := json.Marshal(response)
        if jsonErr != nil {
            http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write(jsonResponse)

        // MQTT
    } else if data["action"] == "registerdevice" && data["name"] != nil {
        stmt, err := db.Prepare("INSERT INTO feeder (serial, food_left, last_feed, owner, weight_cof, name) VALUES (?, 0, NOW(), ?, 0, ?)")
        if err != nil {
            fmt.Println("Error in query:", err)
            return
        }
        defer stmt.Close()

        _, err = stmt.Query(data["serial"], data["owner"], data["name"])
        if err != nil {
            fmt.Println("Error in statement:", err)
            return
        }

        response := map[string]string{"status": "ok"}

        jsonResponse, jsonErr := json.Marshal(response)
        if jsonErr != nil {
            http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write(jsonResponse)

    } else if data["action"] == "addschedule" {
        fmt.Println("wtf")
    } else if data["action"] == "deletedevice" {
        stmt, err := db.Prepare("DELETE FROM feeder WHERE serial=? AND owner=?")
        if err != nil {
            fmt.Println("Error in query:", err)
            return
        }
        defer stmt.Close()

        _, err = stmt.Query(data["serial"], data["owner"])
        if err != nil {
            fmt.Println("Error in statement:", err)
        }

        response := map[string]string{"status": "ok"}

        jsonResponse, jsonErr := json.Marshal(response)
        if jsonErr != nil {
            http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusOK)
        w.Write(jsonResponse)

    } else {
        fmt.Fprintf(w, "Bad request")
    }
}

func main() {
    cfg := mysql.Config{
        User: "admin",
        Passwd: "Admin123",
        Net: "tcp",
        Addr: "127.0.0.1",
        DBName: "bakalauras",
    }

    var err error
    db, err = sql.Open("mysql", cfg.FormatDSN())
    if err != nil {
        log.Fatal(err)
    }

    pingErr := db.Ping()
    if pingErr != nil {
        log.Fatal(pingErr)
    }

    fmt.Println("Connected!")

    http.HandleFunc("/login", loginHandler)
    http.HandleFunc("/devices", devicesHandler)
    http.HandleFunc("/action", actionHandler)
    fmt.Println("Listening on :80...")
    log.Fatal(http.ListenAndServe(":80", nil))
}
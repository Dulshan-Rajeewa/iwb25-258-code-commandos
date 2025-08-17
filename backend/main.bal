import ballerina/http;
import ballerina/log;
import ballerina/uuid;
import ballerina/time;
import ballerina/regex;

configurable string supabaseUrl = "https://sjtzzxqopnyouktcgwwg.supabase.co";
configurable string supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdHp6eHFvcG55b3VrdGNnd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjA3OTcsImV4cCI6MjA2OTc5Njc5N30.ahvznD6ER2eRz8HE5NkXMOF7epq3v3Zp3GWrvZSplWY";

http:Client supabaseClient = check new (supabaseUrl, {
    timeout: 30,
    httpVersion: http:HTTP_1_1
});

listener http:Listener httpListener = new (9090);

function init() returns error? {
    log:printInfo("MediFind Backend v3.0 starting with full Supabase integration on port 9090");
    log:printInfo("Please ensure database tables are created in Supabase using schema.sql");
    log:printInfo("Ready to serve requests with full Supabase integration...");
}

service on httpListener {
    resource function options .(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get .() returns json {
        return {
            name: "MediFind Backend API",
            version: "3.0.0",
            status: "Running",
            database: "Supabase",
            timestamp: time:utcNow()
        };
    }
}

service /api/v1 on httpListener {
    
    resource function options .(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function options [string... paths](http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }
    
    resource function get health() returns json {
        return {
            status: "healthy",
            timestamp: time:utcNow(),
            database: "Supabase",
            supabaseUrl: supabaseUrl
        };
    }

    resource function get supabase/test() returns json|error {
        http:Response response = check supabaseClient->get("/rest/v1/", {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey
        });
        
        return {
            success: true,
            status: response.statusCode,
            message: "Supabase connection successful"
        };
    }

    // DATABASE SETUP ENDPOINT - Creates tables and sample data
    resource function options setup(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post setup() returns json|error {
        log:printInfo("Starting database setup...");
        
        // Create sample pharmacy in Supabase
        json demoPharmacy = {
            "id": "demo-pharmacy-id",
            "name": "Demo Pharmacy",
            "email": "demo@pharmacy.com",
            "password": "demo123",
            "location": "Colombo, Sri Lanka",
            "phone": "+94123456789",
            "license_number": "PH001"
        };
        
        http:Response|error pharmacyResponse = supabaseClient->post("/rest/v1/pharmacies", demoPharmacy, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        });
        
        if pharmacyResponse is error {
            log:printError("Failed to create demo pharmacy: " + pharmacyResponse.message());
        } else {
            log:printInfo("Demo pharmacy created successfully");
        }
        
        // Create sample medicines
        json[] sampleMedicines = [
            {
                "id": "med-001",
                "name": "Paracetamol",
                "price": 25.00,
                "description": "Pain relief and fever reducer",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 100
            },
            {
                "id": "med-002", 
                "name": "Amoxicillin",
                "price": 120.50,
                "description": "Antibiotic for bacterial infections",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 50
            },
            {
                "id": "med-003",
                "name": "Omeprazole", 
                "price": 85.00,
                "description": "Proton pump inhibitor for acid reflux",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 75
            }
        ];
        
        int medicinesCreated = 0;
        foreach json medicine in sampleMedicines {
            http:Response|error medicineResponse = supabaseClient->post("/rest/v1/medicines", medicine, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            });
            
            if medicineResponse is error {
                log:printError("Failed to create medicine: " + medicine.toString() + " - " + medicineResponse.message());
            } else {
                medicinesCreated = medicinesCreated + 1;
            }
        }
        
        return {
            success: true,
            message: "Database setup completed",
            pharmacyCreated: pharmacyResponse is http:Response,
            medicinesCreated: medicinesCreated,
            note: "You can now login with demo@pharmacy.com / demo123"
        };
    }

    // PHARMACY LOGIN
    resource function options pharmacyLogin(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post pharmacyLogin(@http:Payload json loginReq) returns http:Response|error {
        if loginReq is map<json> {
            string email = loginReq["email"].toString();
            string password = loginReq["password"].toString();

            // Find pharmacy by email and password in Supabase
            http:Response response = check supabaseClient->get("/rest/v1/pharmacies?email=eq." + email + "&password=eq." + password, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if response.statusCode != 200 {
                return createErrorResponse(500, "Failed to authenticate with database");
            }

            json pharmacies = check response.getJsonPayload();
            if pharmacies is json[] && pharmacies.length() > 0 {
                json pharmacy = pharmacies[0];
                string pharmacyId = "";
                if pharmacy is map<json> {
                    anydata idValue = pharmacy["id"];
                    if idValue is string {
                        pharmacyId = idValue;
                    }
                }

                // Generate session token
                string token = generateSessionToken(pharmacyId);

                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload({
                    success: true,
                    token: token,
                    userId: pharmacyId,
                    userType: "pharmacy",
                    message: "Login successful with Supabase authentication"
                });
                return res;
            }

            return createErrorResponse(401, "Invalid credentials");
        }

        return createErrorResponse(400, "Invalid login data");
    }

    // PHARMACY REGISTRATION
    resource function options pharmacyRegister(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post pharmacyRegister(@http:Payload json pharmacyReq) returns http:Response|error {
        if pharmacyReq is map<json> {
            string pharmacyId = uuid:createType4AsString();
            
            json pharmacy = {
                "id": pharmacyId,
                "name": pharmacyReq["name"],
                "email": pharmacyReq["email"],
                "password": pharmacyReq["password"],
                "location": pharmacyReq["location"] ?: "",
                "phone": pharmacyReq["phone"] ?: "",
                "license_number": pharmacyReq["licenseNumber"] ?: ""
            };

            // Check if email already exists
            http:Response|error checkResponse = supabaseClient->get("/rest/v1/pharmacies?email=eq." + pharmacyReq["email"].toString(), {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if checkResponse is error {
                log:printError("Supabase connection failed: " + checkResponse.message());
                return createErrorResponse(500, "Database connection failed. Please ensure Supabase tables are created using schema.sql");
            }

            json|error existingPharmacies = checkResponse.getJsonPayload();
            if existingPharmacies is error {
                log:printError("Failed to parse Supabase response: " + existingPharmacies.message());
                return createErrorResponse(500, "Database error. Tables may not exist. Please create tables using schema.sql");
            }

            if existingPharmacies is json[] && existingPharmacies.length() > 0 {
                return createErrorResponse(409, "Pharmacy with this email already exists");
            }

            // Store in Supabase
            http:Response|error response = supabaseClient->post("/rest/v1/pharmacies", pharmacy, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response is error {
                log:printError("Failed to insert into Supabase: " + response.message());
                return createErrorResponse(500, "Failed to register pharmacy. Please ensure database tables are created using schema.sql");
            }

            if response.statusCode != 201 {
                // Get the error details from Supabase
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase insert failed with status: " + response.statusCode.toString() + " - " + errorMsg);
                return createErrorResponse(500, "Failed to register pharmacy in database. Error: " + errorMsg);
            }

            json|error createdPharmacy = response.getJsonPayload();
            if createdPharmacy is error {
                log:printError("Failed to parse created pharmacy: " + createdPharmacy.message());
            }
            
            // Generate session token for auto-login after registration
            string token = generateSessionToken(pharmacyId);
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                message: "Pharmacy registered successfully in Supabase",
                token: token,
                userId: pharmacyId,
                userType: "pharmacy"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid pharmacy data");
    }

    // MEDICINES ENDPOINTS
    resource function options medicines(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get medicines(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get medicines from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/medicines?pharmacy_id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch medicines from database");
        }

        json medicines = check response.getJsonPayload();
        
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            medicines: medicines,
            message: "Medicines fetched successfully from Supabase",
            timestamp: time:utcNow()
        });
        return res;
    }

    resource function post medicines(@http:Payload json medicineReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if medicineReq is map<json> {
            string medicineId = uuid:createType4AsString();
            
            // Process price field
            float price = 0.0;
            anydata priceValue = medicineReq["price"];
            if priceValue is float {
                price = priceValue;
            } else if priceValue is int {
                price = <float>priceValue;
            } else if priceValue is string {
                price = check float:fromString(priceValue);
            }

            json medicine = {
                "id": medicineId,
                "name": medicineReq["name"],
                "price": price,
                "description": medicineReq["description"] ?: "",
                "category": medicineReq["category"] ?: "General",
                "pharmacy_id": pharmacyId,
                "stock": medicineReq["stock"] ?: 0,
                "status": medicineReq["status"] ?: "available",
                "manufacturer": medicineReq["manufacturer"] ?: "",
                "expiry_date": medicineReq["expiry_date"] ?: ()
            };

            // Store in Supabase
            http:Response response = check supabaseClient->post("/rest/v1/medicines", medicine, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 201 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase medicine creation failed: " + errorMsg + " (Status: " + response.statusCode.toString() + ")");
                return createErrorResponse(500, "Failed to add medicine to database: " + errorMsg);
            }

            json createdMedicine = check response.getJsonPayload();
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                message: "Medicine added successfully to Supabase",
                medicine: createdMedicine
            });
            return res;
        }

        return createErrorResponse(400, "Invalid medicine data");
    }

    resource function put medicines/[string medicineId](@http:Payload json medicineReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if medicineReq is map<json> {
            // Build update object with only provided fields
            map<json> updateData = {};
            
            if medicineReq.hasKey("name") {
                updateData["name"] = medicineReq["name"];
            }
            if medicineReq.hasKey("price") {
                float price = 0.0;
                anydata priceValue = medicineReq["price"];
                if priceValue is float {
                    price = priceValue;
                } else if priceValue is int {
                    price = <float>priceValue;
                } else if priceValue is string {
                    price = check float:fromString(priceValue);
                }
                updateData["price"] = price;
            }
            if medicineReq.hasKey("description") {
                updateData["description"] = medicineReq["description"];
            }
            if medicineReq.hasKey("category") {
                updateData["category"] = medicineReq["category"];
            }
            if medicineReq.hasKey("stock") {
                updateData["stock"] = medicineReq["stock"];
            }
            if medicineReq.hasKey("status") {
                updateData["status"] = medicineReq["status"];
            }
            if medicineReq.hasKey("expiry_date") {
                updateData["expiry_date"] = medicineReq["expiry_date"];
            }
            if medicineReq.hasKey("manufacturer") {
                updateData["manufacturer"] = medicineReq["manufacturer"];
            }

            // Update in Supabase with pharmacy ownership check
            http:Response response = check supabaseClient->patch("/rest/v1/medicines?id=eq." + medicineId + "&pharmacy_id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 200 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                return createErrorResponse(500, "Failed to update medicine: " + errorMsg);
            }

            json|error updatedMedicine = response.getJsonPayload();
            if updatedMedicine is error {
                return createErrorResponse(500, "Update successful but failed to retrieve updated data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                medicine: updatedMedicine,
                message: "Medicine updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid update data");
    }

    // ANALYTICS ENDPOINT
    resource function options analytics(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get analytics(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get medicines with analytics data from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/medicines?pharmacy_id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch medicines from database");
        }

        json medicines = check response.getJsonPayload();
        
        // Calculate analytics
        int totalMedicines = 0;
        int lowStockItems = 0;
        int outOfStockItems = 0;
        float totalInventoryValue = 0.0;
        json[] categoryStats = [];
        json[] statusStats = [];
        
        if medicines is json[] {
            totalMedicines = medicines.length();
            
            // Category and status tracking
            map<int> categoryCount = {};
            map<int> statusCount = {};
            
            foreach json medicine in medicines {
                if medicine is map<json> {
                    // Stock analysis
                    anydata stockValue = medicine["stock"];
                    int stock = 0;
                    if stockValue is int {
                        stock = stockValue;
                    }
                    
                    if stock == 0 {
                        outOfStockItems = outOfStockItems + 1;
                    } else if stock <= 10 {
                        lowStockItems = lowStockItems + 1;
                    }
                    
                    // Inventory value calculation
                    anydata priceValue = medicine["price"];
                    float price = 0.0;
                    if priceValue is float {
                        price = priceValue;
                    } else if priceValue is int {
                        price = <float>priceValue;
                    }
                    totalInventoryValue = totalInventoryValue + (price * <float>stock);
                    
                    // Category stats
                    anydata categoryValue = medicine["category"];
                    string category = "General";
                    if categoryValue is string {
                        category = categoryValue;
                    }
                    
                    if categoryCount.hasKey(category) {
                        categoryCount[category] = categoryCount.get(category) + 1;
                    } else {
                        categoryCount[category] = 1;
                    }
                    
                    // Status stats
                    anydata statusValue = medicine["status"];
                    string status = "available";
                    if statusValue is string {
                        status = statusValue;
                    }
                    
                    if statusCount.hasKey(status) {
                        statusCount[status] = statusCount.get(status) + 1;
                    } else {
                        statusCount[status] = 1;
                    }
                }
            }
            
            // Convert maps to arrays
            foreach var [category, count] in categoryCount.entries() {
                categoryStats.push({
                    "category": category,
                    "count": count
                });
            }
            
            foreach var [status, count] in statusCount.entries() {
                statusStats.push({
                    "status": status,
                    "count": count
                });
            }
        }
        
        json analyticsData = {
            "totalMedicines": totalMedicines,
            "lowStockItems": lowStockItems,
            "outOfStockItems": outOfStockItems,
            "totalInventoryValue": totalInventoryValue,
            "categoryBreakdown": categoryStats,
            "statusBreakdown": statusStats,
            "timestamp": time:utcNow()
        };

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            analytics: analyticsData,
            message: "Analytics data generated successfully"
        });
        return res;
    }

    // SEARCH ENDPOINT
    resource function options search(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post search(@http:Payload json searchReq) returns http:Response|error {
        string medicineName = "";
        if searchReq is map<json> {
            anydata medNameValue = searchReq["medicineName"];
            if medNameValue is string {
                medicineName = medNameValue;
            }
        }
        
        // Search medicines in Supabase using ilike for case-insensitive partial matching
        string searchQuery = "/rest/v1/medicines?name=ilike.*" + medicineName + "*";
        http:Response response = check supabaseClient->get(searchQuery, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to search medicines in database");
        }

        json medicines = check response.getJsonPayload();
        int totalCount = 0;
        if medicines is json[] {
            totalCount = medicines.length();
        }

        json responseBody = {
            medicines: medicines,
            totalCount: totalCount,
            searchTerm: medicineName,
            message: totalCount > 0 ? "Search completed successfully" : "No medicines found",
            dataSource: "Supabase Database"
        };

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload(responseBody);
        return res;
    }

    // PHARMACY INFO
    resource function options pharmacyInfo(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get pharmacyInfo(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get pharmacy info from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/pharmacies?id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch pharmacy info from database");
        }

        json pharmacies = check response.getJsonPayload();
        if pharmacies is json[] && pharmacies.length() > 0 {
            json pharmacy = pharmacies[0];
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                pharmacy: pharmacy,
                message: "Pharmacy info fetched successfully from Supabase"
            });
            return res;
        }

        return createErrorResponse(404, "Pharmacy not found");
    }

    resource function put pharmacyInfo(@http:Payload json updateReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if updateReq is map<json> {
            // Build update object with only provided fields
            map<json> updateData = {};
            
            if updateReq.hasKey("name") {
                updateData["name"] = updateReq["name"];
            }
            if updateReq.hasKey("email") {
                updateData["email"] = updateReq["email"];
            }
            if updateReq.hasKey("phone") {
                updateData["phone"] = updateReq["phone"];
            }
            if updateReq.hasKey("location") {
                updateData["location"] = updateReq["location"];
            }
            if updateReq.hasKey("license_number") {
                updateData["license_number"] = updateReq["license_number"];
            }

            // Update in Supabase
            http:Response response = check supabaseClient->patch("/rest/v1/pharmacies?id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 200 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase update failed: " + errorMsg);
                return createErrorResponse(500, "Failed to update pharmacy info: " + errorMsg);
            }

            json|error updatedPharmacy = response.getJsonPayload();
            if updatedPharmacy is error {
                log:printError("Failed to parse updated pharmacy: " + updatedPharmacy.message());
                return createErrorResponse(500, "Update successful but failed to retrieve updated data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                pharmacy: updatedPharmacy,
                message: "Pharmacy info updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid update data");
    }
}

// UTILITY FUNCTIONS
function validateToken(string? authHeader) returns string? {
    if authHeader is () {
        return ();
    }
    
    if !authHeader.startsWith("Bearer ") {
        return ();
    }
    
    string token = authHeader.substring(7);
    
    // Extract pharmacy ID from token format: mh_PHARMACY_ID_UUID
    if token.startsWith("mh_") {
        string[] parts = regex:split(token, "_");
        if parts.length() >= 3 {
            return parts[1]; // Return the pharmacy ID part
        }
    }
    
    return ();
}

function generateSessionToken(string pharmacyId) returns string {
    return "mh_" + pharmacyId + "_" + uuid:createType4AsString();
}

function createErrorResponse(int statusCode, string message) returns http:Response {
    http:Response res = new;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = statusCode;
    res.setJsonPayload({
        success: false,
        message: message,
        timestamp: time:utcNow()
    });
    return res;
}

## Hi there 👋

---

## Difference between JDK, JRE, and JVM

### Overview

| Component | Full Name | Purpose |
|-----------|-----------|---------|
| **JVM** | Java Virtual Machine | Executes Java bytecode on the host machine |
| **JRE** | Java Runtime Environment | Provides libraries + JVM to *run* Java programs |
| **JDK** | Java Development Kit | Provides tools + JRE to *develop and run* Java programs |

### Relationship

```
JDK
 └── JRE
      └── JVM
```

- **JVM** is the engine that runs `.class` (bytecode) files. It is platform-specific (Windows/Linux/macOS each have their own JVM), but bytecode is platform-independent ("Write Once, Run Anywhere").
- **JRE** = JVM + core class libraries (e.g., `java.lang`, `java.util`). It is what you need if you only want to *run* a Java application.
- **JDK** = JRE + development tools (`javac` compiler, `javadoc`, `jar`, debugger, etc.). It is what you need if you want to *write and compile* Java source code.

---

### Code Samples

#### 1. Writing and compiling with the JDK (`javac`)

The JDK provides the `javac` compiler that converts `.java` source files into `.class` bytecode files.

**HelloWorld.java**
```java
// This source file is compiled using the JDK tool: javac
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Compile with the JDK:
```bash
javac HelloWorld.java   # produces HelloWorld.class (bytecode)
java  HelloWorld        # JVM inside JRE executes the bytecode
```

---

#### 2. JVM — executing bytecode

The JVM loads and executes the `.class` file produced by `javac`. It handles memory management (garbage collection), security, and translates bytecode to native machine instructions at runtime (JIT compilation).

```java
// Demonstrates JVM memory management (garbage collection)
public class JvmDemo {
    public static void main(String[] args) {
        // JVM allocates heap memory for this object
        StringBuilder sb = new StringBuilder("JVM manages this memory");
        System.out.println(sb);
        // Once 'sb' goes out of scope, the JVM's garbage collector
        // will reclaim the heap memory automatically.
    }
}
```

---

#### 3. JRE — using standard class libraries at runtime

The JRE bundles the core Java class libraries that programs depend on at runtime. The JVM alone cannot run Java programs without these libraries.

```java
import java.util.ArrayList;   // part of JRE class libraries
import java.util.List;

// This program only needs the JRE to run (no compilation step shown).
public class JreDemo {
    public static void main(String[] args) {
        List<String> languages = new ArrayList<>();
        languages.add("Java");
        languages.add("Kotlin");
        languages.add("Scala");

        for (String lang : languages) {
            System.out.println("Language: " + lang);
        }
    }
}
```

---

### Quick Summary

- Use the **JDK** when you are a *developer* writing or building Java applications.
- Use the **JRE** when you only need to *run* an existing Java application (end users).
- The **JVM** is always present inside both the JRE and the JDK — it is the runtime engine that actually executes the code.
